import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Order } from './order.schema';

export type OrderListResult = {
	items: WithId<Order>[];
	pagination: ApiPagination;
};
