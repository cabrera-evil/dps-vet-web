import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { ClinicalMeasurement } from './clinical-measurement.schema';

export const MEASUREMENTS_COLLECTION = 'clinical-measurements';

/**
 * Firestore-backed repository for the `clinical-measurements` collection —
 * the patient's measurement history. Rows are created only when a consultation
 * is finalized (see `ConsultationRepository.finalizeDraft`).
 */
export class ClinicalMeasurementRepository extends FirestoreRepository<ClinicalMeasurement> {
	constructor() {
		super(MEASUREMENTS_COLLECTION);
	}
}
