import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { Breed } from './breed.schema';

const COLLECTION = 'breeds';

/**
 * Read-oriented repository for the seed-managed `breeds` catalog — administered
 * via `scripts/seed`, not the API, so no write surface is exposed.
 */
export class BreedRepository extends FirestoreRepository<Breed> {
	constructor() {
		super(COLLECTION);
	}

	list(species?: string) {
		return this.findMany({
			where: species
				? [{ field: 'species', op: '==', value: species }]
				: undefined,
			orderBy: [{ field: 'name', direction: 'asc' }],
		});
	}
}
