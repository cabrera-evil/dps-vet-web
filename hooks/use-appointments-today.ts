import type { AppointmentsReport } from '@/app/api/reports/report.types';
import { AppointmentStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { useGet } from '@/hooks/use-rest';
import { hasPermission } from '@/utils/permission';
import { endOfDay, startOfDay } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useAppointmentsToday() {
	const { data: session } = useSession();
	const canReadReports = hasPermission(session?.user?.permissions, [
		Permission.REPORTS_READ,
	]);

	const params = useMemo(() => {
		const now = new Date();
		return {
			from: startOfDay(now).toISOString(),
			to: endOfDay(now).toISOString(),
		};
	}, []);

	const { data, isLoading, isError } = useGet<AppointmentsReport>(
		{ path: '/reports/appointments', params },
		{ enabled: canReadReports }
	);

	return {
		total: data?.total,
		pending: data?.byStatus[AppointmentStatus.PENDING],
		isLoading: canReadReports && isLoading,
		isError,
	};
}
