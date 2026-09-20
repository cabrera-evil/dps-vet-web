import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, ok } from '@/app/api/_shared/http/response';
import createHttpError from 'http-errors';
import type { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
	createMedicalRecordSchema,
	listMedicalRecordsQuerySchema,
	requestAttachmentUploadSchema,
	updateMedicalRecordSchema,
} from './medical-record.schema';
import type { MedicalRecordService } from './medical-record.service';

const attachmentDownloadQuerySchema = z.object({ path: z.string().min(1) });

/**
 * Translates HTTP <-> {@link MedicalRecordService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore/Storage types.
 */
export class MedicalRecordController {
	constructor(private readonly service: MedicalRecordService) {}

	async list(request: NextRequest, identity: Identity): Promise<NextResponse> {
		const query = parseSearchParams(request, listMedicalRecordsQuerySchema);
		const { items, pagination } = await this.service.list(identity, query);
		return ok(items, { pagination });
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}

	async create(request: Request, identity: Identity): Promise<NextResponse> {
		const input = await parseBody(request, createMedicalRecordSchema);
		return created(await this.service.create(identity, input));
	}

	async update(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, updateMedicalRecordSchema);
		return ok(await this.service.update(identity, id, input));
	}

	async requestAttachmentUpload(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, requestAttachmentUploadSchema);
		return created(
			await this.service.requestAttachmentUpload(identity, id, input)
		);
	}

	async getAttachmentDownloadUrl(
		request: NextRequest,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const parsed = attachmentDownloadQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams.entries())
		);
		if (!parsed.success)
			throw new createHttpError.BadRequest('path is required');
		return ok(
			await this.service.getAttachmentDownloadUrl(
				identity,
				id,
				parsed.data.path
			)
		);
	}
}
