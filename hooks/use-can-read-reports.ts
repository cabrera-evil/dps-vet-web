import { Permission } from '@/constants/permission';
import { usePermissions } from '@/hooks/use-permissions';

export function useCanReadReports(): boolean {
	return usePermissions().hasPermission([Permission.REPORTS_READ]);
}
