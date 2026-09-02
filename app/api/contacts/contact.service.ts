import type { FirestoreCrudRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import { ContactStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type {
	Contact,
	CreateContactInput,
	ListContactsQuery,
	UpdateContactInput,
} from './contact.schema';
import type { ContactListResult } from './contact.types';

/**
 * Contact domain logic. Depends on the {@link FirestoreCrudRepository}
 * abstraction (DIP) — the concrete repository is chosen in `contact.module.ts`.
 */
export class ContactService {
	constructor(private readonly repo: FirestoreCrudRepository<Contact>) {}

	async list(query: ListContactsQuery): Promise<ContactListResult> {
		const { page, pageSize, status } = query;
		const where: FirestoreQueryOptions<Contact>['where'] = status
			? [{ field: 'status', op: '==', value: status }]
			: undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
				orderBy: [{ field: 'createdAt', direction: 'desc' }],
				offset: (page - 1) * pageSize,
				limit: pageSize,
			}),
			this.repo.count({ where }),
		]);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				pageCount: Math.max(1, Math.ceil(total / pageSize)),
			},
		};
	}

	async getById(id: string): Promise<WithId<Contact>> {
		const contact = await this.repo.findById(id);
		if (!contact) throw new createHttpError.NotFound('Contact not found');
		return contact;
	}

	submit(input: CreateContactInput): Promise<WithId<Contact>> {
		return this.repo.create({
			...input,
			status: ContactStatus.NEW,
			createdAt: new Date().toISOString(),
		});
	}

	async updateStatus(
		id: string,
		input: UpdateContactInput
	): Promise<WithId<Contact>> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Contact not found');
		await this.repo.update(id, { status: input.status });
		return this.getById(id);
	}

	async remove(id: string): Promise<void> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Contact not found');
		await this.repo.delete(id);
	}
}
