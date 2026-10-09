import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { ClinicalEncounter } from './encounter.schema';

export const ENCOUNTERS_COLLECTION = 'clinical-encounters';

/**
 * Firestore-backed repository for the `clinical-encounters` collection.
 * Writes happen inside the consultations module's transactions, so that the
 * encounter and its consultation content always change together.
 */
export class EncounterRepository extends FirestoreRepository<ClinicalEncounter> {
	constructor() {
		super(ENCOUNTERS_COLLECTION);
	}
}
