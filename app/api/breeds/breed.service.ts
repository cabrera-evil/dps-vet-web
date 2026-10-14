import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { BreedRepository } from './breed.repository';
import type { Breed, ListBreedsQuery } from './breed.schema';

export class BreedService {
	constructor(private readonly repo: BreedRepository) {}

	list(query: ListBreedsQuery): Promise<WithId<Breed>[]> {
		return this.repo.list(query.species);
	}
}
