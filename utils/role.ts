import { Role } from '@/constants/enum';

export function hasRequiredRole(userRole: Role, allowedRoles: Role[]): boolean {
	// allow all if no roles are required
	if (!allowedRoles.length) return true;
	// Role hierarchy: SUPER_ADMIN > ADMIN > USER
	const roleHierarchy = {
		[Role.USER]: 1,
		[Role.ADMIN]: 2,
		[Role.SUPER_ADMIN]: 3,
	};
	// Get the user's role level
	const userRoleLevel = roleHierarchy[userRole];
	// Check if user's role level meets or exceeds any of the allowed roles
	return allowedRoles.some((role) => {
		const requiredRoleLevel = roleHierarchy[role];
		return userRoleLevel >= requiredRoleLevel;
	});
}
