import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type {
	FirestoreCrudRepository,
	FirestoreReadRepository,
} from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import type { Breed } from '@/app/api/breeds/breed.schema';
import type { User } from '@/app/api/users/user.schema';
import { Permission } from '@/constants/permission';
import { RoleName } from '@/constants/roles';
import { hasPermission } from '@/utils/permission';
import { FieldValue, type UpdateData } from 'firebase-admin/firestore';
import createHttpError from 'http-errors';
import type { PetRepository } from './pet.repository';
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
	constructor(
		private readonly repo: PetRepository & FirestoreCrudRepository<Pet>,
		private readonly breedRepo: FirestoreReadRepository<Breed>,
		private readonly userRepo: FirestoreReadRepository<User>
	) {}

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

	/**
	 * Breeds are scoped per species in the `breeds` catalog. A species with
	 * catalog breeds requires one of them; a species without any has no breed
	 * (a breed sent for it is dropped).
	 */
	private async resolveBreed(
		species: string,
		breed?: string
	): Promise<string | undefined> {
		const options = await this.breedRepo.findMany({
			where: [{ field: 'species', op: '==', value: species }],
		});
		if (options.length === 0) return undefined;
		if (!breed) throw new createHttpError.BadRequest('breed is required');
		if (!options.some((option) => option.name === breed))
			throw new createHttpError.BadRequest(`Unknown breed for ${species}`);
		return breed;
	}

	/**
	 * Only {@link Permission.PETS_MANAGE_ALL} callers may register a pet for
	 * someone else, and that someone must be an existing client.
	 */
	private async resolveOwnerId(
		identity: Identity,
		ownerId?: string
	): Promise<string> {
		if (!ownerId || ownerId === identity.uid) return identity.uid;
		if (!this.canManageAll(identity)) throw new createHttpError.Forbidden();

		const owner = await this.userRepo.findById(ownerId);
		if (owner?.role !== RoleName.CLIENTE)
			throw new createHttpError.UnprocessableEntity('Owner must be a client');
		return ownerId;
	}

	async create(
		identity: Identity,
		input: CreatePetInput
	): Promise<WithId<Pet>> {
		const { weightKg, ownerId, ...fields } = input;
		// Weight is clinical data: only staff may record it.
		if (weightKg !== undefined) assertClinicalStaff(identity);

		const pet: Pet = {
			...fields,
			breed: await this.resolveBreed(fields.species, fields.breed),
			ownerId: await this.resolveOwnerId(identity, ownerId),
			createdAt: new Date().toISOString(),
		};
		return weightKg === undefined
			? this.repo.create(pet)
			: this.repo.createWithWeight(pet, weightKg, identity.uid);
	}

	async update(
		identity: Identity,
		id: string,
		input: UpdatePetInput
	): Promise<WithId<Pet>> {
		const pet = await this.getById(identity, id);

		const data: UpdateData<Pet> = { ...input };
		if (input.species !== undefined || input.breed !== undefined) {
			const species = input.species ?? pet.species;
			// A new species never inherits the previous species' breed.
			const breed =
				input.breed ?? (species === pet.species ? pet.breed : undefined);
			data.breed =
				(await this.resolveBreed(species, breed)) ?? FieldValue.delete();
		}

		await this.repo.update(id, data);
		return this.getById(identity, id);
	}

	async remove(identity: Identity, id: string): Promise<void> {
		await this.getById(identity, id);
		await this.repo.delete(id);
	}
}
