import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Medication } from './medication.schema';

export type MedicationListResult = {
	items: WithId<Medication>[];
	pagination: ApiPagination;
};
