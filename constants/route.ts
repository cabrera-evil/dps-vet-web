import { Permission } from './permission';

// Public routes (redirect authenticated users away)
export const authRoutes = ['/auth/*'];

// Permission-based protected routes
export const protectedRoutes = [
	{
		path: '/admin/*',
		requiredPermissions: [Permission.CONTACTS_READ],
	},
];
