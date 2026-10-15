import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { tokenSchema } from './token.schema';
import type { TokenService } from './token.service';

/** Translates HTTP <-> {@link TokenService}; parsing and response shaping only. */
export class TokenController {
	constructor(private readonly service: TokenService) {}

	async issue(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, tokenSchema);
		const response = ok(await this.service.issue(input));
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}
}
