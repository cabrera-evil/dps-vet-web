import type { FirestoreCrudRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import createHttpError from 'http-errors';
import type {
	CreateServiceInput,
	ListServicesQuery,
	Service,
	UpdateServiceInput,
} from './service.schema';
import type { ServiceListResult } from './service.types';

/**
 * Service-catalog domain logic. Depends on the {@link FirestoreCrudRepository}
 * abstraction (DIP) — the concrete repository is chosen in `service.module.ts`.
 * `GET` is public (see `route.ts`); mutation routes are admin-only.
 */
export class ServiceCatalogService {
	constructor(private readonly repo: FirestoreCrudRepository<Service>) {}

	async list(query: ListServicesQuery): Promise<ServiceListResult> {
		const { page, pageSize, category, active } = query;
		const clauses: NonNullable<FirestoreQueryOptions<Service>['where']> = [];
		if (category)
			clauses.push({ field: 'category', op: '==', value: category });
		if (typeof active === 'boolean')
			clauses.push({ field: 'active', op: '==', value: active });
		const where = clauses.length ? clauses : undefined;

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

	async getById(id: string): Promise<WithId<Service>> {
		const service = await this.repo.findById(id);
		if (!service) throw new createHttpError.NotFound('Service not found');
		return service;
	}

	create(input: CreateServiceInput): Promise<WithId<Service>> {
		return this.repo.create({
			...input,
			createdAt: new Date().toISOString(),
		});
	}

	async update(
		id: string,
		input: UpdateServiceInput
	): Promise<WithId<Service>> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Service not found');
		await this.repo.update(id, input);
		return this.getById(id);
	}

	async remove(id: string): Promise<void> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Service not found');
		await this.repo.delete(id);
	}
}
