import type { FirestoreCrudRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import createHttpError from 'http-errors';
import type {
	CreateMedicationInput,
	ListMedicationsQuery,
	Medication,
	UpdateMedicationInput,
} from './medication.schema';
import type { MedicationListResult } from './medication.types';

/**
 * Medication-catalog domain logic. Depends on the
 * {@link FirestoreCrudRepository} abstraction (DIP) — the concrete
 * repository is chosen in `medication.module.ts`. `GET` is public (see
 * `route.ts`); mutation routes are admin-only. Stock decrements happen only
 * via the `orders` module's transactional flow, never here.
 */
export class MedicationCatalogService {
	constructor(private readonly repo: FirestoreCrudRepository<Medication>) {}

	async list(query: ListMedicationsQuery): Promise<MedicationListResult> {
		const { page, pageSize, active } = query;
		const where: FirestoreQueryOptions<Medication>['where'] =
			typeof active === 'boolean'
				? [{ field: 'active', op: '==', value: active }]
				: undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
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

	async getById(id: string): Promise<WithId<Medication>> {
		const medication = await this.repo.findById(id);
		if (!medication) throw new createHttpError.NotFound('Medication not found');
		return medication;
	}

	create(input: CreateMedicationInput): Promise<WithId<Medication>> {
		return this.repo.create(input);
	}

	async update(
		id: string,
		input: UpdateMedicationInput
	): Promise<WithId<Medication>> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Medication not found');
		await this.repo.update(id, input);
		return this.getById(id);
	}

	async remove(id: string): Promise<void> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('Medication not found');
		await this.repo.delete(id);
	}
}
