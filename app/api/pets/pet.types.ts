import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Pet } from './pet.schema';

export type PetListResult = {
	items: WithId<Pet>[];
	pagination: ApiPagination;
};
