import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { TREATMENT_PLANS_COLLECTION } from '@/app/api/treatment-plans/treatment-plan.repository';
import type {
	MedicationAdministrationDocument,
	MedicationOrderDocument,
	TreatmentPlanDocument,
} from '@/app/api/treatment-plans/treatment-plan.schema';
import { ApplicationStatus, TreatmentStatus } from '@/constants/enum';
import createHttpError from 'http-errors';

export const ADMINISTRATIONS_COLLECTION = 'medication-administrations';

const IN_OPERATOR_LIMIT = 30;

export type ScheduledApplicationContext = {
	plan: TreatmentPlanDocument;
	order: MedicationOrderDocument;
	application: MedicationAdministrationDocument;
};

export type ApplicationUpdate = Partial<MedicationAdministrationDocument>;

/**
 * Firestore-backed repository for the `medication-administrations`
 * collection — one row per scheduled application.
 */
export class MedicationAdministrationRepository extends FirestoreRepository<MedicationAdministrationDocument> {
	constructor() {
		super(ADMINISTRATIONS_COLLECTION);
	}

	/** Unordered; chunked because `in` accepts at most 30 values. */
	async findByPlans(
		planIds: string[]
	): Promise<WithId<MedicationAdministrationDocument>[]> {
		const uniqueIds = [...new Set(planIds)];
		if (uniqueIds.length === 0) return [];

		const chunks: string[][] = [];
		for (let i = 0; i < uniqueIds.length; i += IN_OPERATOR_LIMIT)
			chunks.push(uniqueIds.slice(i, i + IN_OPERATOR_LIMIT));

		try {
			const snapshots = await Promise.all(
				chunks.map((chunk) =>
					this.collection.where('treatmentPlanId', 'in', chunk).get()
				)
			);
			return snapshots.flatMap((snapshot) =>
				snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
			);
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Updates one application of a plan. The plan and the application are read
	 * first inside the transaction, so the rules apply to the documents as they
	 * are at commit time and two concurrent writers can't both win.
	 * `buildUpdate` is pure and may throw HTTP errors.
	 */
	async updateScheduled(
		planId: string,
		applicationId: string,
		buildUpdate: (context: ScheduledApplicationContext) => ApplicationUpdate
	): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const applicationRef = this.collection.doc(applicationId);
				const [planSnapshot, applicationSnapshot] = await Promise.all([
					transaction.get(
						firestore().collection(TREATMENT_PLANS_COLLECTION).doc(planId)
					),
					transaction.get(applicationRef),
				]);
				if (!planSnapshot.exists || !applicationSnapshot.exists)
					throw new createHttpError.NotFound('Application not found');
				const plan = planSnapshot.data() as TreatmentPlanDocument;
				const application =
					applicationSnapshot.data() as MedicationAdministrationDocument;
				const order = plan.orders.find(({ id }) => id === application.orderId);
				if (application.treatmentPlanId !== planId || !order)
					throw new createHttpError.NotFound('Application not found');
				if (
					plan.status !== TreatmentStatus.ACTIVE ||
					order.status !== TreatmentStatus.ACTIVE
				)
					throw new createHttpError.UnprocessableEntity(
						'The treatment is not active'
					);
				if (application.status !== ApplicationStatus.SCHEDULED)
					throw new createHttpError.Conflict(
						'Esta aplicación ya fue registrada'
					);

				transaction.update(
					applicationRef,
					buildUpdate({ plan, order, application })
				);
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
