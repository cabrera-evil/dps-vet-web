import type { Identity } from '@/app/api/_shared/http/http.types';
import type {
	FirestoreCrudRepository,
	ReadRepository,
} from '@/app/api/_shared/repository/repository.contract';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { Pet } from '@/app/api/pets/pet.schema';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import { FieldValue, type UpdateData } from 'firebase-admin/firestore';
import createHttpError from 'http-errors';
import type {
	CreateMedicalHistoryInput,
	ListMedicalHistoriesQuery,
	MedicalHistory,
	UpdateMedicalHistoryInput,
} from './medical-history.schema';
import type { MedicalHistoryListResult } from './medical-history.types';

/**
 * Medical-history domain logic. Clinical data is staff-only in Phase 1: every
 * operation requires {@link Permission.MEDICAL_RECORDS_MANAGE_ALL}. Histories
 * are archived (`archived`), never deleted. Depends only on repository
 * abstractions (DIP); concrete repositories are chosen in
 * `medical-history.module.ts`.
 */
export class MedicalHistoryService {
	constructor(
		private readonly repo: FirestoreCrudRepository<MedicalHistory>,
		private readonly petRepo: ReadRepository<Pet>
	) {}

	private assertStaff(identity: Identity): void {
		if (
			!hasPermission(identity.permissions, [
				Permission.MEDICAL_RECORDS_MANAGE_ALL,
			])
		)
			throw new createHttpError.Forbidden();
	}

	private async assertPetExists(petId: string): Promise<void> {
		if (!(await this.petRepo.exists(petId)))
			throw new createHttpError.NotFound('Pet not found');
	}

	private async getById(id: string): Promise<WithId<MedicalHistory>> {
		const history = await this.repo.findById(id);
		if (!history)
			throw new createHttpError.NotFound('Medical history not found');
		return history;
	}

	async list(
		identity: Identity,
		petId: string,
		query: ListMedicalHistoriesQuery
	): Promise<MedicalHistoryListResult> {
		this.assertStaff(identity);
		await this.assertPetExists(petId);

		const { page, pageSize } = query;
		const where = [
			{ field: 'petId' as const, op: '==' as const, value: petId },
			{ field: 'archived' as const, op: '==' as const, value: false },
		];

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

	async create(
		identity: Identity,
		petId: string,
		input: CreateMedicalHistoryInput
	): Promise<WithId<MedicalHistory>> {
		this.assertStaff(identity);
		await this.assertPetExists(petId);

		const now = new Date().toISOString();
		return this.repo.create({
			...input,
			alertType: input.isAlert ? input.alertType : undefined,
			petId,
			archived: false,
			createdAt: now,
			createdBy: identity.uid,
			updatedAt: now,
			updatedBy: identity.uid,
		});
	}

	async update(
		identity: Identity,
		id: string,
		input: UpdateMedicalHistoryInput
	): Promise<WithId<MedicalHistory>> {
		this.assertStaff(identity);
		const history = await this.getById(id);
		if (history.archived)
			throw new createHttpError.UnprocessableEntity(
				'Cannot edit an archived medical history'
			);

		const isAlert = input.isAlert ?? history.isAlert;
		const alertType = input.alertType ?? history.alertType;
		if (isAlert && !alertType)
			throw new createHttpError.BadRequest(
				'alertType is required when isAlert is true'
			);

		const { approximateDate, description, ...rest } = input;
		const data: UpdateData<MedicalHistory> = {
			...rest,
			updatedAt: new Date().toISOString(),
			updatedBy: identity.uid,
		};
		if (approximateDate !== undefined)
			data.approximateDate = approximateDate ?? FieldValue.delete();
		if (description !== undefined)
			data.description = description ?? FieldValue.delete();
		if (!isAlert) data.alertType = FieldValue.delete();
		else if (input.alertType) data.alertType = input.alertType;

		await this.repo.update(id, data);
		return this.getById(id);
	}

	/** Idempotent: archiving an already archived history returns it unchanged. */
	async archive(
		identity: Identity,
		id: string
	): Promise<WithId<MedicalHistory>> {
		this.assertStaff(identity);
		const history = await this.getById(id);
		if (history.archived) return history;

		const now = new Date().toISOString();
		await this.repo.update(id, {
			archived: true,
			archivedAt: now,
			archivedBy: identity.uid,
			updatedAt: now,
			updatedBy: identity.uid,
		});
		return this.getById(id);
	}
}
