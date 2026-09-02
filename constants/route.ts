import { Role } from './enum';

// Public routes (redirect authenticated users away)
export const authRoutes = ['/auth/*'];

// Role-based protected routes
export const protectedRoutes = [
	{
		path: '/admin/*',
		allowedRoles: [Role.ADMIN, Role.SUPER_ADMIN],
	},
];
