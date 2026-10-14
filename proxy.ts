import { getPermissions } from '@/app/api/_shared/permissions/permissions.module';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { Permission } from './constants/permission';
import { authRoutes, protectedRoutes } from './constants/route';
import { hasPermission } from './utils/permission';

interface RouteConfig {
	path: string;
	requiredPermissions: Permission[];
}

// Pattern semantics (first match wins, so list specific entries before general):
// - no '*': exact match.
// - only a trailing '/*': legacy prefix match (startsWith the part before '/*').
// - a '*' in the middle: segment-wise match; each mid '*' is exactly one
//   non-empty segment. If the pattern also ends in '/*', that tail matches any
//   remaining path (zero or more segments); otherwise segment counts must be equal.
//   Unmatched requests fall through to later, broader entries (fail closed).
function matchPattern(pathname: string, path: string) {
	if (!path.includes('*')) return pathname === path;
	const hasTail = path.endsWith('/*');
	const base = hasTail ? path.slice(0, -2) : path;
	if (!base.includes('*')) return pathname.startsWith(path.replace('/*', ''));
	const p = base.split('/');
	const s = pathname.split('/');
	if (hasTail ? s.length < p.length : s.length !== p.length) return false;
	return p.every((seg, i) => (seg === '*' ? s[i] !== '' : s[i] === seg));
}

function matchRoute<T extends string | RouteConfig>(
	pathname: string,
	routes: T[]
) {
	for (const route of routes) {
		const path = typeof route === 'string' ? route : route.path;
		if (matchPattern(pathname, path)) return route;
	}
	return null;
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	// Get the token using next-auth
	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET,
		secureCookie: process.env.NODE_ENV === 'production',
	});
	// Early return for non-auth routes
	const isAuthRoute = matchRoute(pathname, authRoutes);
	const isProtectedRoute = matchRoute(pathname, protectedRoutes);
	const isAuthenticated = Boolean(token?.sub);
	// Handle public routes (redirect authenticated users)
	if (isAuthRoute && isAuthenticated)
		return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
	// Handle permission-based routes
	if (isProtectedRoute) {
		// First check if user is authenticated
		if (!isAuthenticated)
			return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
		// Then check CURRENT permissions (Firestore); fail closed on any error
		let userPermissions: Permission[];
		try {
			userPermissions = await getPermissions(token!.sub!);
		} catch {
			return NextResponse.redirect(new URL('/unauthorized', request.nextUrl));
		}
		if (!hasPermission(userPermissions, isProtectedRoute.requiredPermissions)) {
			// Redirect to unauthorized page or home page
			return NextResponse.redirect(new URL('/unauthorized', request.nextUrl));
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
