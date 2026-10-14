import type { AppointmentsReport } from '@/app/api/reports/report.types';
import { AppointmentStatus } from '@/constants/enum';
import { useCanReadReports } from '@/hooks/use-can-read-reports';
import { useGet } from '@/hooks/use-rest';
import { endOfDay, startOfDay } from 'date-fns';
import { useMemo } from 'react';

export function useAppointmentsToday() {
	const canReadReports = useCanReadReports();

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
