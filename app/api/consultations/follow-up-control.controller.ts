import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { registerControlInputSchema } from './follow-up-control.schema';
import type { FollowUpControlService } from './follow-up-control.service';

/**
 * Translates HTTP <-> {@link FollowUpControlService}. Owns request
 * parsing/validation and response shaping only — no domain rules.
 */
export class FollowUpControlController {
	constructor(private readonly service: FollowUpControlService) {}

	async get(identity: Identity, followUpId: string): Promise<NextResponse> {
		return ok(await this.service.get(identity, followUpId));
	}

	async register(
		request: Request,
		identity: Identity,
		followUpId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, registerControlInputSchema);
		return ok(await this.service.register(identity, followUpId, input));
	}
}
