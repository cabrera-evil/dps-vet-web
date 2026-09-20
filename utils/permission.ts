import { Permission } from '@/constants/permission';

export function hasPermission(
	userPermissions: Permission[] | undefined,
	required: Permission[],
	mode: 'any' | 'all' = 'any'
): boolean {
	// allow all if no permissions are required
	if (!required.length) return true;
	if (!userPermissions?.length) return false;
	const granted = new Set(userPermissions);
	return mode === 'all'
		? required.every((permission) => granted.has(permission))
		: required.some((permission) => granted.has(permission));
}
