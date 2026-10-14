import type { Identity } from '@/app/api/_shared/http/http.types';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';

/**
 * Returns the caller's CURRENT permissions. The uid comes only from the
 * identity resolved by `withAuth` (session); query/path/body are ignored.
 */
export class PermissionsController {
	get(_request: Request, identity: Identity): NextResponse {
		const response = ok({ permissions: identity.permissions });
		response.headers.set('Cache-Control', 'no-store');
		return response;
	}
}
