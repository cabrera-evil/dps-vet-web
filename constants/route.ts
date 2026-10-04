import { Permission } from './permission';

// Public routes (redirect authenticated users away)
export const authRoutes = ['/auth/*'];

// Permission-based protected routes. An empty `requiredPermissions` array
// means the route only requires authentication, granting access to any
// signed-in user regardless of their specific permissions.
// Specific routes must precede the `/dashboard/*` fallback: the first match wins.
export const protectedRoutes = [
	{
		path: '/dashboard/appointments/*',
		requiredPermissions: [Permission.APPOINTMENTS_READ],
	},
	{
		path: '/dashboard/patients/*',
		requiredPermissions: [Permission.PETS_READ],
	},
	{
		path: '/dashboard/services/*',
		requiredPermissions: [Permission.SERVICES_WRITE],
	},
	{
		path: '/dashboard/clients/*',
		requiredPermissions: [Permission.USERS_READ],
	},
	{
		path: '/dashboard/inventory/*',
		requiredPermissions: [Permission.MEDICATIONS_WRITE],
	},
	{
		path: '/dashboard/settings/*',
		requiredPermissions: [Permission.USERS_UPDATE],
	},
	{
		path: '/dashboard/*',
		requiredPermissions: [] as Permission[],
	},
];
