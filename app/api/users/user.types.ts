import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { User } from './user.schema';

export type UserListResult = {
	items: WithId<User>[];
	pagination: ApiPagination;
};
