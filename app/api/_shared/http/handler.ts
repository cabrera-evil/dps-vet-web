import { verifyFirebaseIdToken } from '@/app/api/_shared/firebase/verify-id-token';
import { auth } from '@/auth';
import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type { NextRequest } from 'next/server';
import type { RouteHandler } from './http.types';
import { failure } from './response';

/**
 * Outermost wrapper for every route handler: turns any thrown value into a
 * normalized error response. Compose as `withRoute(withAuth(fn, [...]))`.
 */
export function withRoute(handler: RouteHandler): RouteHandler {
	return async (request, context) => {
		try {
			return await handler(request, context);
		} catch (error) {
			return failure(error);
		}
	};
}

interface ResolvedIdentity {
	uid: string;
	permissions: Permission[];
}

/**
 * Resolves the caller's identity from either the NextAuth session cookie
 * (web) or an `Authorization: Bearer <firebaseIdToken>` header (future
 * mobile app), producing the same `{ uid, permissions }` shape regardless of
 * which path authenticated the caller.
 */
async function resolveIdentity(
	request: NextRequest
): Promise<ResolvedIdentity | null> {
	const authorizationHeader = request.headers.get('authorization');
	if (authorizationHeader?.startsWith('Bearer ')) {
		const idToken = authorizationHeader.slice('Bearer '.length).trim();
		if (!idToken) return null;
		const identity = await verifyFirebaseIdToken(idToken);
		return { uid: identity.uid, permissions: identity.permissions };
	}
	const session = await auth();
	if (!session?.user) return null;
	return { uid: session.user.uid, permissions: session.user.permissions };
}

/**
 * Requires an authenticated identity, and optionally one of `permissions`
 * (set-membership via `hasPermission`).
 */
export function withAuth(
	handler: RouteHandler,
	permissions?: Permission[],
	mode: 'any' | 'all' = 'any'
): RouteHandler {
	return async (request, context) => {
		const identity = await resolveIdentity(request);
		if (!identity) throw new createHttpError.Unauthorized();
		if (
			permissions?.length &&
			!hasPermission(identity.permissions, permissions, mode)
		)
			throw new createHttpError.Forbidden();
		return handler(request, context);
	};
}
