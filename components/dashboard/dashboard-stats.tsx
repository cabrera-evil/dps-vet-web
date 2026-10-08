'use client';

import {
	DashboardStatCard,
	type DashboardStat,
} from '@/components/dashboard/dashboard-stat-card';
import { dashboardStats } from '@/components/dashboard/mocks/dashboard.mock';
import { useAppointmentsToday } from '@/hooks/use-appointments-today';
import { useLowStock } from '@/hooks/use-low-stock';
import { CalendarClock, TriangleAlert } from 'lucide-react';

const EMPTY_VALUE = '—';

export function DashboardStats() {
	const { total, pending, isLoading, isError } = useAppointmentsToday();
	const lowStock = useLowStock();

	const appointmentsToday: DashboardStat = {
		label: 'Citas hoy',
		value: total?.toString() ?? EMPTY_VALUE,
		description: isError
			? 'No se pudo cargar'
			: `${pending ?? 0} pendientes de confirmar`,
		icon: CalendarClock,
		isLoading,
	};

	const lowStockMedications: DashboardStat = {
		label: 'Medicamentos con bajo stock',
		value: lowStock.count?.toString() ?? EMPTY_VALUE,
		description: lowStock.isError
			? 'No se pudo cargar'
			: 'Requieren reabastecimiento',
		icon: TriangleAlert,
		isLoading: lowStock.isLoading,
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{[appointmentsToday, lowStockMedications, ...dashboardStats].map(
				(stat) => (
					<DashboardStatCard key={stat.label} {...stat} />
				)
			)}
		</div>
	);
}
