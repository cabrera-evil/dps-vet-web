import { auth } from '@/auth';
import { Role } from '@/constants/enum';
import { hasRequiredRole } from '@/utils/role';
import createHttpError from 'http-errors';
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

/**
 * Requires an authenticated session, and optionally one of `roles` (using the
 * `hasRequiredRole` hierarchy). Reads the session via next-auth's `auth()`.
 */
export function withAuth(handler: RouteHandler, roles?: Role[]): RouteHandler {
	return async (request, context) => {
		const session = await auth();
		if (!session?.user) throw new createHttpError.Unauthorized();
		if (roles?.length) {
			const role = session.user.role;
			if (!role || !hasRequiredRole(role, roles))
				throw new createHttpError.Forbidden();
		}
		return handler(request, context);
	};
}
