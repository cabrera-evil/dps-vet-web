import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { googleSignInSchema } from './google.schema';
import type { GoogleService } from './google.service';

/** Translates HTTP <-> {@link GoogleService}; parsing and response shaping only. */
export class GoogleController {
	constructor(private readonly service: GoogleService) {}

	async issue(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, googleSignInSchema);
		const response = ok(await this.service.issue(input));
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}
}
