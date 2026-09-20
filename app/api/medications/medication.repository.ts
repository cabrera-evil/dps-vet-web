import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { Medication } from './medication.schema';

const COLLECTION = 'medications';

/**
 * Firestore-backed repository for the `medications` collection. Inherits
 * the full CRUD surface from {@link FirestoreRepository}. Transactional
 * stock decrements for order fulfillment live in `order.repository.ts`,
 * which reads/writes this same collection inside its own transaction.
 */
export class MedicationRepository extends FirestoreRepository<Medication> {
	constructor() {
		super(COLLECTION);
	}
}
