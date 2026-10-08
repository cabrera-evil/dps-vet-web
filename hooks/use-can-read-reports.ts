import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';

export function useCanReadReports(): boolean {
	const { data: session } = useSession();
	return hasPermission(session?.user?.permissions, [Permission.REPORTS_READ]);
}
