import { Permission } from './permission';

// Public routes (redirect authenticated users away)
export const authRoutes = ['/auth/*'];

// Permission-based protected routes. An empty `requiredPermissions` array
// means the route only requires authentication, granting access to any
// signed-in user regardless of their specific permissions.
export const protectedRoutes = [
	{
		path: '/dashboard/*',
		requiredPermissions: [] as Permission[],
	},
];
