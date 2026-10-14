import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { MedicalHistory } from './medical-history.schema';

const COLLECTION = 'medical-histories';

/**
 * Firestore-backed repository for the `medical-histories` collection.
 * Inherits the full CRUD surface from {@link FirestoreRepository}; histories
 * are archived by the service, never deleted.
 */
export class MedicalHistoryRepository extends FirestoreRepository<MedicalHistory> {
	constructor() {
		super(COLLECTION);
	}
}
