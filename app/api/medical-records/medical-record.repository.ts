import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { MedicalRecord } from './medical-record.schema';

const COLLECTION = 'medical-records';

/**
 * Firestore-backed repository for the `medical-records` collection.
 * Inherits the full CRUD surface from {@link FirestoreRepository}; only
 * collection-specific reads are added here.
 */
export class MedicalRecordRepository extends FirestoreRepository<MedicalRecord> {
	constructor() {
		super(COLLECTION);
	}

	findByPet(petId: string) {
		return this.findMany({
			where: [{ field: 'petId', op: '==', value: petId }],
			orderBy: [{ field: 'date', direction: 'desc' }],
		});
	}
}
