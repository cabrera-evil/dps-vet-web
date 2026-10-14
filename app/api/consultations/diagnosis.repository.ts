import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { Diagnosis } from './diagnosis.schema';

export const DIAGNOSES_COLLECTION = 'diagnoses';

/**
 * Firestore-backed repository for the `diagnoses` collection. Rows are
 * created only when a consultation is finalized (see
 * `ConsultationRepository.finalizeDraft`).
 */
export class DiagnosisRepository extends FirestoreRepository<Diagnosis> {
	constructor() {
		super(DIAGNOSES_COLLECTION);
	}
}
