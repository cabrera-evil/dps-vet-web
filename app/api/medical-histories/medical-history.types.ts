import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { MedicalHistory } from './medical-history.schema';

export type MedicalHistoryListResult = {
	items: WithId<MedicalHistory>[];
	pagination: ApiPagination;
};
