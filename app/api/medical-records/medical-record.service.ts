import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { storage } from '@/app/api/_shared/firebase';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type {
	FirestoreCrudRepository,
	ReadRepository,
} from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import type { Pet } from '@/app/api/pets/pet.schema';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import { FieldValue } from 'firebase-admin/firestore';
import createHttpError from 'http-errors';
import { randomUUID } from 'node:crypto';
import type {
	CreateMedicalRecordInput,
	ListMedicalRecordsQuery,
	MedicalRecord,
	RequestAttachmentUploadInput,
	UpdateMedicalRecordInput,
} from './medical-record.schema';
import type {
	AttachmentDownloadResult,
	AttachmentUploadResult,
	MedicalRecordListResult,
} from './medical-record.types';

/** Signed download URLs expire quickly — never a public/permanent link. */
const DOWNLOAD_URL_TTL_MS = 15 * 60 * 1000;
const UPLOAD_URL_TTL_MS = 15 * 60 * 1000;

/**
 * Medical-record domain logic. Depends only on repository abstractions
 * (DIP); concrete repositories are chosen in `medical-record.module.ts`.
 * Only the Storage **path** is ever persisted in `attachmentPaths` — never a
 * public URL; reads issue a short-lived signed download URL instead.
 */
export class MedicalRecordService {
	constructor(
		private readonly repo: FirestoreCrudRepository<MedicalRecord>,
		private readonly petRepo: ReadRepository<Pet>
	) {}

	private canManageAll(identity: Identity): boolean {
		return hasPermission(identity.permissions, [
			Permission.MEDICAL_RECORDS_MANAGE_ALL,
		]);
	}

	/** Throws 404 unless the caller owns the pet or has the manage-all bypass. */
	private async assertPetAccess(
		identity: Identity,
		petId: string
	): Promise<void> {
		if (this.canManageAll(identity)) return;
		const pet = await this.petRepo.findById(petId);
		if (!pet || pet.ownerId !== identity.uid)
			throw new createHttpError.NotFound('Pet not found');
	}

	async list(
		identity: Identity,
		query: ListMedicalRecordsQuery
	): Promise<MedicalRecordListResult> {
		const { page, pageSize, petId } = query;
		if (petId) await this.assertPetAccess(identity, petId);
		else if (!this.canManageAll(identity))
			throw new createHttpError.BadRequest(
				'petId is required for non-staff callers'
			);

		const where: FirestoreQueryOptions<MedicalRecord>['where'] = petId
			? [{ field: 'petId', op: '==', value: petId }]
			: undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
				orderBy: [{ field: 'date', direction: 'desc' }],
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

	async getById(
		identity: Identity,
		id: string
	): Promise<WithId<MedicalRecord>> {
		const record = await this.repo.findById(id);
		if (!record) throw new createHttpError.NotFound('Medical record not found');
		await this.assertPetAccess(identity, record.petId);
		return record;
	}

	async create(
		identity: Identity,
		input: CreateMedicalRecordInput
	): Promise<WithId<MedicalRecord>> {
		await this.assertPetAccess(identity, input.petId);

		return this.repo.create({
			...input,
			staffId: identity.uid,
			attachmentPaths: [],
		});
	}

	async update(
		identity: Identity,
		id: string,
		input: UpdateMedicalRecordInput
	): Promise<WithId<MedicalRecord>> {
		await this.getById(identity, id);
		await this.repo.update(id, input);
		return this.getById(identity, id);
	}

	/** Issues a signed upload URL and reserves the Storage path on the record. */
	async requestAttachmentUpload(
		identity: Identity,
		id: string,
		input: RequestAttachmentUploadInput
	): Promise<AttachmentUploadResult> {
		const record = await this.getById(identity, id);
		const path = `medical-records/${record.petId}/${id}/${randomUUID()}-${input.fileName}`;

		try {
			const [uploadUrl] = await storage()
				.bucket()
				.file(path)
				.getSignedUrl({
					action: 'write',
					expires: Date.now() + UPLOAD_URL_TTL_MS,
					contentType: input.contentType,
				});
			// arrayUnion, not a read-modify-write spread — two concurrent
			// upload requests for the same record must not clobber each
			// other's reserved path.
			await this.repo.update(id, {
				attachmentPaths: FieldValue.arrayUnion(path),
			});
			return { path, uploadUrl };
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/** Issues a short-lived signed download URL, scoped to the caller's pet access. */
	async getAttachmentDownloadUrl(
		identity: Identity,
		id: string,
		path: string
	): Promise<AttachmentDownloadResult> {
		const record = await this.getById(identity, id);
		if (!record.attachmentPaths.includes(path))
			throw new createHttpError.NotFound('Attachment not found');

		try {
			const [downloadUrl] = await storage()
				.bucket()
				.file(path)
				.getSignedUrl({
					action: 'read',
					expires: Date.now() + DOWNLOAD_URL_TTL_MS,
				});
			return { downloadUrl };
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}
}
