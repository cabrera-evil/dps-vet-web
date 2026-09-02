import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Contact } from './contact.schema';

export type ContactListResult = {
	items: WithId<Contact>[];
	pagination: ApiPagination;
};
