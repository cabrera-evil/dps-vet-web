import type { AppointmentsReport } from '@/app/api/reports/report.types';
import { useCanReadReports } from '@/hooks/use-can-read-reports';
import { useGet } from '@/hooks/use-rest';
import { startOfDay, subDays } from 'date-fns';
import { useMemo } from 'react';

const DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AppointmentsByDay = { day: string; count: number };

// Appointments per day for the last DAYS days (today included), zero-filled.
// ponytail: day keys are UTC dates, matching the server's `start.slice(0, 10)` grouping.
export function useAppointmentsReport() {
	const canReadReports = useCanReadReports();

	const { params, days } = useMemo(() => {
		const now = Date.now();
		return {
			params: {
				from: startOfDay(subDays(now, DAYS - 1)).toISOString(),
				to: new Date(now).toISOString(),
			},
			days: Array.from({ length: DAYS }, (_, index) =>
				new Date(now - (DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10)
			),
		};
	}, []);

	const { data, isLoading, isError } = useGet<AppointmentsReport>(
		{ path: '/reports/appointments', params },
		{ enabled: canReadReports }
	);

	const byDay: AppointmentsByDay[] = days.map((day) => ({
		day,
		count: data?.byDay[day] ?? 0,
	}));

	return {
		byDay,
		total: byDay.reduce((sum, entry) => sum + entry.count, 0),
		isLoading: canReadReports && isLoading,
		isError,
	};
}
