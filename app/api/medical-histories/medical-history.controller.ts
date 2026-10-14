import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createMedicalHistorySchema,
	listMedicalHistoriesQuerySchema,
	updateMedicalHistorySchema,
} from './medical-history.schema';
import type { MedicalHistoryService } from './medical-history.service';

/**
 * Translates HTTP <-> {@link MedicalHistoryService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class MedicalHistoryController {
	constructor(private readonly service: MedicalHistoryService) {}

	async list(
		request: NextRequest,
		identity: Identity,
		petId: string
	): Promise<NextResponse> {
		const query = parseSearchParams(request, listMedicalHistoriesQuerySchema);
		const { items, pagination } = await this.service.list(
			identity,
			petId,
			query
		);
		return ok(items, { pagination });
	}

	async create(
		request: Request,
		identity: Identity,
		petId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, createMedicalHistorySchema);
		return created(await this.service.create(identity, petId, input));
	}

	async update(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, updateMedicalHistorySchema);
		return ok(await this.service.update(identity, id, input));
	}

	async archive(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.archive(identity, id));
	}
}
