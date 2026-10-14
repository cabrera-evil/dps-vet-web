import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseSearchParams } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import { listEncountersQuerySchema } from './encounter.schema';
import type { EncounterService } from './encounter.service';

/**
 * Translates HTTP <-> {@link EncounterService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class EncounterController {
	constructor(private readonly service: EncounterService) {}

	async list(
		request: NextRequest,
		identity: Identity,
		petId: string
	): Promise<NextResponse> {
		const query = parseSearchParams(request, listEncountersQuerySchema);
		const { items, pagination } = await this.service.list(
			identity,
			petId,
			query
		);
		return ok(items, { pagination });
	}
}
