import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { ADMINISTRATIONS_COLLECTION } from '@/app/api/medication-administrations/medication-administration.repository';
import { ApplicationStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type { CloseWritesResult } from './treatment-plan.builder';
import type {
	MedicationAdministrationDocument,
	TreatmentPlanDocument,
} from './treatment-plan.schema';
import { MAX_PLAN_LIST_SIZE } from './treatment-plan.schema';
import type {
	AdministrationWrite,
	DocumentWrite,
} from './treatment-plan.types';

export const TREATMENT_PLANS_COLLECTION = 'treatment-plans';

export const MAX_CLOSE_WRITES = 450;

export type OpenPlanSnapshot = {
	plan: DocumentWrite<TreatmentPlanDocument>;
	administrations: AdministrationWrite[];
};

/**
 * Firestore-backed repository for the `treatment-plans` collection;
 * every read here is bounded.
 */
export class TreatmentPlanRepository extends FirestoreRepository<TreatmentPlanDocument> {
	constructor() {
		super(TREATMENT_PLANS_COLLECTION);
	}

	findByPet(
		petId: string,
		limit = MAX_PLAN_LIST_SIZE
	): Promise<WithId<TreatmentPlanDocument>[]> {
		return this.findMany({
			where: [{ field: 'petId', op: '==', value: petId }],
			orderBy: [{ field: 'startsAt', direction: 'desc' }],
			limit,
		});
	}

	findByFollowUp(followUpId: string): Promise<WithId<TreatmentPlanDocument>[]> {
		return this.findMany({
			where: [{ field: 'followUpId', op: '==', value: followUpId }],
			limit: MAX_PLAN_LIST_SIZE,
		});
	}

	/**
	 * Closes a plan. The plan and its scheduled applications are read first
	 * inside the transaction, so the rules apply to the documents as they are
	 * at commit time and two concurrent closes can't both win.
	 * `buildWrites` is pure (the transaction may retry) and may throw HTTP errors.
	 */
	async closeOpenPlan(
		planId: string,
		buildWrites: (snapshot: OpenPlanSnapshot) => CloseWritesResult
	): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const planRef = this.collection.doc(planId);
				const [planSnapshot, administrationsSnapshot] = await Promise.all([
					transaction.get(planRef),
					transaction.get(
						firestore()
							.collection(ADMINISTRATIONS_COLLECTION)
							.where('treatmentPlanId', '==', planId)
							.where('status', '==', ApplicationStatus.SCHEDULED)
					),
				]);
				if (!planSnapshot.exists)
					throw new createHttpError.NotFound('Treatment plan not found');

				const writes = buildWrites({
					plan: {
						id: planId,
						data: planSnapshot.data() as TreatmentPlanDocument,
					},
					administrations: administrationsSnapshot.docs.map((doc) => ({
						id: doc.id,
						data: doc.data() as MedicationAdministrationDocument,
					})),
				});
				if (writes.operationCount > MAX_CLOSE_WRITES)
					throw new createHttpError.UnprocessableEntity(
						'Too many scheduled applications to cancel in one operation'
					);

				transaction.set(planRef, writes.plan.data);
				for (const { id, data } of writes.cancelled)
					transaction.update(
						firestore().collection(ADMINISTRATIONS_COLLECTION).doc(id),
						data
					);
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
