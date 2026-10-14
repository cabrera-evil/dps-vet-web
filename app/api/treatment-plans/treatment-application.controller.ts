import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { TreatmentApplicationService } from './treatment-application.service';
import {
	registerApplicationInputSchema,
	skipApplicationInputSchema,
} from './treatment-plan.schema';

/**
 * Translates HTTP <-> {@link TreatmentApplicationService}. Owns request
 * parsing/validation and response shaping only — no domain rules.
 */
export class TreatmentApplicationController {
	constructor(private readonly service: TreatmentApplicationService) {}

	async register(
		request: Request,
		identity: Identity,
		planId: string,
		applicationId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, registerApplicationInputSchema);
		return ok(
			await this.service.register(identity, planId, applicationId, input)
		);
	}

	async skip(
		request: Request,
		identity: Identity,
		planId: string,
		applicationId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, skipApplicationInputSchema);
		return ok(await this.service.skip(identity, planId, applicationId, input));
	}
}
