import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import { ENCOUNTERS_COLLECTION } from '@/app/api/encounters/encounter.repository';
import type { ClinicalEncounter } from '@/app/api/encounters/encounter.schema';
import { ConsultationStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import { MEASUREMENTS_COLLECTION } from './clinical-measurement.repository';
import type { ConsultationContent } from './consultation.schema';
import type {
	ConsultationSnapshot,
	FinalizationWrites,
} from './consultation.types';
import { DIAGNOSES_COLLECTION } from './diagnosis.repository';
import { FOLLOW_UPS_COLLECTION } from './follow-up.repository';

const COLLECTION = 'consultations';

/**
 * Firestore-backed repository for the `consultations` collection (clinical
 * content, keyed by the same id as its `clinical-encounters` document).
 * Inherits the full CRUD surface from {@link FirestoreRepository}; adds the
 * operations that must keep the encounter, the content and the finalized
 * history rows atomic. Every status-dependent write re-reads the encounter
 * inside the transaction, so a concurrent edit and finalize can't both win.
 */
export class ConsultationRepository extends FirestoreRepository<ConsultationContent> {
	constructor() {
		super(COLLECTION);
	}

	/** Creates the encounter and its content together; returns the shared id. */
	async createDraft(
		encounter: ClinicalEncounter,
		content: ConsultationContent
	): Promise<string> {
		try {
			const encounterRef = firestore().collection(ENCOUNTERS_COLLECTION).doc();
			const batch = firestore().batch();
			batch.set(encounterRef, encounter);
			batch.set(this.collection.doc(encounterRef.id), content);
			await batch.commit();
			return encounterRef.id;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/** Replaces a draft's encounter and content, only while it is still a draft (and, if given, unchanged since `expectedUpdatedAt`). */
	async replaceDraft(
		id: string,
		encounter: ClinicalEncounter,
		content: ConsultationContent,
		expectedUpdatedAt?: string
	): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const encounterRef = firestore()
					.collection(ENCOUNTERS_COLLECTION)
					.doc(id);
				const snapshot = await transaction.get(encounterRef);
				if (!snapshot.exists)
					throw new createHttpError.NotFound('Consultation not found');
				const current = snapshot.data() as ClinicalEncounter;
				if (current.status !== ConsultationStatus.DRAFT)
					throw new createHttpError.UnprocessableEntity(
						`Cannot edit a consultation with status ${current.status}`
					);
				if (expectedUpdatedAt && expectedUpdatedAt !== current.updatedAt)
					throw new createHttpError.Conflict(
						'The consultation was modified by someone else'
					);

				transaction.set(encounterRef, encounter);
				transaction.set(this.collection.doc(id), content);
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Finalizes a draft. `buildWrites` runs inside the transaction against the
	 * documents as they are at commit time, so the service's rules apply to
	 * what is actually being finalized; it returns the encounter update plus
	 * the history rows (measurements, diagnoses, follow-up) to create. Row ids
	 * are deterministic, so a retry can never duplicate them.
	 */
	async finalizeDraft(
		id: string,
		buildWrites: (snapshot: ConsultationSnapshot) => FinalizationWrites
	): Promise<void> {
		try {
			await firestore().runTransaction(async (transaction) => {
				const encounterRef = firestore()
					.collection(ENCOUNTERS_COLLECTION)
					.doc(id);
				const [encounterSnapshot, consultationSnapshot] = await Promise.all([
					transaction.get(encounterRef),
					transaction.get(this.collection.doc(id)),
				]);
				if (!encounterSnapshot.exists || !consultationSnapshot.exists)
					throw new createHttpError.NotFound('Consultation not found');
				const encounter = encounterSnapshot.data() as ClinicalEncounter;
				if (encounter.status !== ConsultationStatus.DRAFT)
					throw new createHttpError.UnprocessableEntity(
						`Cannot finalize a consultation with status ${encounter.status}`
					);

				const writes = buildWrites({
					encounter,
					consultation: consultationSnapshot.data() as ConsultationContent,
				});

				transaction.set(encounterRef, writes.encounter);
				for (const { id: rowId, data } of writes.measurements)
					transaction.set(
						firestore().collection(MEASUREMENTS_COLLECTION).doc(rowId),
						data
					);
				for (const { id: rowId, data } of writes.diagnoses)
					transaction.set(
						firestore().collection(DIAGNOSES_COLLECTION).doc(rowId),
						data
					);
				if (writes.followUp)
					transaction.set(
						firestore()
							.collection(FOLLOW_UPS_COLLECTION)
							.doc(writes.followUp.id),
						writes.followUp.data
					);
			});
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
