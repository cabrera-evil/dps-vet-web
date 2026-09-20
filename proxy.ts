import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { Permission } from './constants/permission';
import { authRoutes, protectedRoutes } from './constants/route';
import { hasPermission } from './utils/permission';

interface RouteConfig {
	path: string;
	requiredPermissions: Permission[];
}

function matchRoute<T extends string | RouteConfig>(
	pathname: string,
	routes: T[]
) {
	for (const route of routes) {
		const path = typeof route === 'string' ? route : route.path;
		const isMatch = path.includes('*')
			? pathname.startsWith(path.replace('/*', ''))
			: pathname === path;
		if (isMatch) return route;
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
	const userPermissions = (token?.permissions as Permission[]) ?? [];
	// Handle public routes (redirect authenticated users)
	if (isAuthRoute && isAuthenticated)
		return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
	// Handle permission-based routes
	if (isProtectedRoute) {
		// First check if user is authenticated
		if (!isAuthenticated)
			return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
		// Then check if user has required permissions
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
