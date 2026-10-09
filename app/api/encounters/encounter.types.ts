import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { ClinicalEncounter } from './encounter.schema';

export type EncounterListResult = {
	items: WithId<ClinicalEncounter>[];
	pagination: ApiPagination;
};
