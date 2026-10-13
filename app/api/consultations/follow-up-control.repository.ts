import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { ADMINISTRATIONS_COLLECTION } from '@/app/api/medication-administrations/medication-administration.repository';
import { TREATMENT_PLANS_COLLECTION } from '@/app/api/treatment-plans/treatment-plan.repository';
import {
	MAX_PLAN_LIST_SIZE,
	type MedicationAdministrationDocument,
	type TreatmentPlanDocument,
} from '@/app/api/treatment-plans/treatment-plan.schema';
import { ApplicationStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import { CONTROL_ALREADY_REGISTERED_MESSAGE } from './follow-up-control.builder';
import type { FollowUpControl } from './follow-up-control.schema';
import type { ControlSnapshot, ControlWrites } from './follow-up-control.types';
import { FOLLOW_UPS_COLLECTION } from './follow-up.repository';
import type { FollowUp } from './follow-up.schema';

export const FOLLOW_UP_CONTROLS_COLLECTION = 'follow-up-controls';

export const MAX_CONTROL_WRITES = 450;

const DEFAULT_LIST_SIZE = 20;

/**
 * Firestore-backed repository for the `follow-up-controls` collection,
 * written with its follow-up's completion in one transaction.
 */
export class FollowUpControlRepository extends FirestoreRepository<FollowUpControl> {
	constructor() {
		super(FOLLOW_UP_CONTROLS_COLLECTION);
	}

	findLatestByPet(petId: string): Promise<WithId<FollowUpControl> | null> {
		return this.findOne({
			where: [{ field: 'petId', op: '==', value: petId }],
			orderBy: [{ field: 'registeredAt', direction: 'desc' }],
		});
	}

	findByPet(
		petId: string,
		limit = DEFAULT_LIST_SIZE
	): Promise<WithId<FollowUpControl>[]> {
		return this.findMany({
			where: [{ field: 'petId', op: '==', value: petId }],
			orderBy: [{ field: 'registeredAt', direction: 'desc' }],
			limit,
		});
	}

	/**
	 * Registers the control of a follow-up. The follow-up, its control, the
	 * plans linked to it and their scheduled applications are all read first
	 * inside the transaction, so the rules apply to the documents as they are
	 * at commit time and two concurrent controls can't both win.
	 * `buildWrites` is pure (the transaction may retry) and may throw HTTP errors.
	 */
	async registerControl(
		followUpId: string,
		buildWrites: (snapshot: ControlSnapshot) => ControlWrites
	): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const db = firestore();
				const followUpRef = db
					.collection(FOLLOW_UPS_COLLECTION)
					.doc(followUpId);
				const controlRef = this.collection.doc(followUpId);
				const nextFollowUpRef = db
					.collection(FOLLOW_UPS_COLLECTION)
					.doc(`${followUpId}-next`);
				const [
					followUpSnapshot,
					controlSnapshot,
					nextFollowUpSnapshot,
					plansSnapshot,
				] = await Promise.all([
					transaction.get(followUpRef),
					transaction.get(controlRef),
					transaction.get(nextFollowUpRef),
					transaction.get(
						db
							.collection(TREATMENT_PLANS_COLLECTION)
							.where('followUpId', '==', followUpId)
							.limit(MAX_PLAN_LIST_SIZE)
					),
				]);
				if (!followUpSnapshot.exists)
					throw new createHttpError.NotFound('Follow-up not found');
				if (controlSnapshot.exists)
					throw new createHttpError.Conflict(
						CONTROL_ALREADY_REGISTERED_MESSAGE
					);

				const plans = plansSnapshot.docs.map((doc) => ({
					id: doc.id,
					data: doc.data() as TreatmentPlanDocument,
				}));
				const administrations = await Promise.all(
					plans.map(({ id }) =>
						transaction.get(
							db
								.collection(ADMINISTRATIONS_COLLECTION)
								.where('treatmentPlanId', '==', id)
								.where('status', '==', ApplicationStatus.SCHEDULED)
						)
					)
				);

				const writes = buildWrites({
					followUp: followUpSnapshot.data() as FollowUp,
					nextFollowUpExists: nextFollowUpSnapshot.exists,
					plans,
					administrationsByPlan: new Map(
						plans.map(({ id }, index) => [
							id,
							administrations[index].docs.map((doc) => ({
								id: doc.id,
								data: doc.data() as MedicationAdministrationDocument,
							})),
						])
					),
				});
				if (writes.operationCount > MAX_CONTROL_WRITES)
					throw new createHttpError.UnprocessableEntity(
						'Too many scheduled applications to update in one operation'
					);

				transaction.set(controlRef, writes.control);
				transaction.update(followUpRef, writes.followUpUpdate);
				if (writes.nextFollowUp)
					transaction.set(nextFollowUpRef, writes.nextFollowUp.data);
				for (const { id, data } of writes.plans)
					transaction.set(
						db.collection(TREATMENT_PLANS_COLLECTION).doc(id),
						data
					);
				for (const { id, data } of writes.cancelled)
					transaction.update(
						db.collection(ADMINISTRATIONS_COLLECTION).doc(id),
						data
					);
				for (const { id, data } of writes.created)
					transaction.set(
						db.collection(ADMINISTRATIONS_COLLECTION).doc(id),
						data
					);
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
