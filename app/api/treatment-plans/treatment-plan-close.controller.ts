import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { TreatmentPlanCloseService } from './treatment-plan-close.service';
import { closeTreatmentSchema } from './treatment-plan.schema';

/**
 * Translates HTTP <-> {@link TreatmentPlanCloseService}. Owns request
 * parsing/validation and response shaping only — no domain rules.
 */
export class TreatmentPlanCloseController {
	constructor(private readonly service: TreatmentPlanCloseService) {}

	async close(
		request: Request,
		identity: Identity,
		planId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, closeTreatmentSchema);
		return ok(await this.service.close(identity, planId, input));
	}
}
