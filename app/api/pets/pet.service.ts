import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreCrudRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type {
	CreatePetInput,
	ListPetsQuery,
	Pet,
	UpdatePetInput,
} from './pet.schema';
import type { PetListResult } from './pet.types';

/**
 * Pet domain logic. Depends on the {@link FirestoreCrudRepository}
 * abstraction (DIP) — the concrete repository is chosen in `pet.module.ts`.
 *
 * Tenant isolation: a caller without {@link Permission.PETS_MANAGE_ALL} may
 * only see/mutate pets they own (`ownerId === identity.uid`, resolved from
 * the verified token — never from the request). Staff/admin bypass the
 * ownership filter via that permission.
 */
export class PetService {
	constructor(private readonly repo: FirestoreCrudRepository<Pet>) {}

	private canManageAll(identity: Identity): boolean {
		return hasPermission(identity.permissions, [Permission.PETS_MANAGE_ALL]);
	}

	async list(identity: Identity, query: ListPetsQuery): Promise<PetListResult> {
		const { page, pageSize, ownerId } = query;
		const effectiveOwnerId = this.canManageAll(identity)
			? ownerId
			: identity.uid;

		const where: FirestoreQueryOptions<Pet>['where'] = effectiveOwnerId
			? [{ field: 'ownerId', op: '==', value: effectiveOwnerId }]
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

	async getById(identity: Identity, id: string): Promise<WithId<Pet>> {
		const pet = await this.repo.findById(id);
		if (!pet || (!this.canManageAll(identity) && pet.ownerId !== identity.uid))
			throw new createHttpError.NotFound('Pet not found');
		return pet;
	}

	create(identity: Identity, input: CreatePetInput): Promise<WithId<Pet>> {
		return this.repo.create({
			...input,
			ownerId: identity.uid,
			createdAt: new Date().toISOString(),
		});
	}

	async update(
		identity: Identity,
		id: string,
		input: UpdatePetInput
	): Promise<WithId<Pet>> {
		await this.getById(identity, id);
		await this.repo.update(id, input);
		return this.getById(identity, id);
	}

	async remove(identity: Identity, id: string): Promise<void> {
		await this.getById(identity, id);
		await this.repo.delete(id);
	}
}
