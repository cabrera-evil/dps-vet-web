import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Service } from './service.schema';

export type ServiceListResult = {
	items: WithId<Service>[];
	pagination: ApiPagination;
};
