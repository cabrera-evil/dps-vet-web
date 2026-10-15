import type { Identity } from '@/app/api/_shared/http/http.types';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { LogoutService } from './logout.service';

/** Translates HTTP <-> {@link LogoutService}; takes no request input. */
export class LogoutController {
	constructor(private readonly service: LogoutService) {}

	async logout(_request: Request, identity: Identity): Promise<NextResponse> {
		await this.service.logout(identity);
		const response = ok({ loggedOut: true });
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}
}
