import type { Identity } from '@/app/api/_shared/http/http.types';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { ClinicalSummaryService } from './clinical-summary.service';

/**
 * Translates HTTP <-> {@link ClinicalSummaryService}. Response shaping only —
 * no domain rules, no Firestore types.
 */
export class ClinicalSummaryController {
	constructor(private readonly service: ClinicalSummaryService) {}

	async get(identity: Identity, petId: string): Promise<NextResponse> {
		return ok(await this.service.get(identity, petId));
	}
}
