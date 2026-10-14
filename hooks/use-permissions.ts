import { Permission } from '@/constants/permission';
import { useGet } from '@/hooks/use-rest';
import { PermissionsResponse } from '@/types/permission.type';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';

const NO_PERMISSIONS: Permission[] = [];

export type PermissionsStatus = 'loading' | 'ready' | 'error';

/**
 * Single source of the caller's CURRENT permissions (GET /auth/permissions).
 * Default deny: the list is empty until the status is `ready`, so no staff or
 * client-only UI renders on stale assumptions. UX layer only; the API enforces.
 * The shared react-query entry dedupes requests across all consumers.
 */
export function usePermissions() {
	const { status: sessionStatus } = useSession();
	const isAuthenticated = sessionStatus === 'authenticated';

	const { data, isError, isSuccess } = useGet<PermissionsResponse>(
		{ path: '/auth/permissions' },
		{
			enabled: isAuthenticated,
			staleTime: 0,
			gcTime: 0,
			refetchOnMount: true,
			refetchOnWindowFocus: true,
		}
	);

	const status: PermissionsStatus = isError
		? 'error'
		: isSuccess || sessionStatus === 'unauthenticated'
			? 'ready'
			: 'loading';
	const permissions = isSuccess ? data.permissions : NO_PERMISSIONS;

	return {
		permissions,
		status,
		isReady: status === 'ready',
		hasPermission: (
			required: Permission[],
			mode: 'any' | 'all' = 'any'
		): boolean => hasPermission(permissions, required, mode),
	};
}
