import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { refreshSchema } from './refresh.schema';
import type { RefreshService } from './refresh.service';

/** Translates HTTP <-> {@link RefreshService}; parsing and response shaping only. */
export class RefreshController {
	constructor(private readonly service: RefreshService) {}

	async refresh(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, refreshSchema);
		const response = ok(await this.service.refresh(input));
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}
}
