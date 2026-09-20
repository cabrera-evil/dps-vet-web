import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { Pet } from './pet.schema';

const COLLECTION = 'pets';

/**
 * Firestore-backed repository for the `pets` collection. Inherits the full
 * CRUD surface from {@link FirestoreRepository}; only collection-specific
 * reads are added here.
 */
export class PetRepository extends FirestoreRepository<Pet> {
	constructor() {
		super(COLLECTION);
	}

	findByOwner(ownerId: string) {
		return this.findMany({
			where: [{ field: 'ownerId', op: '==', value: ownerId }],
			orderBy: [{ field: 'createdAt', direction: 'desc' }],
		});
	}
}
