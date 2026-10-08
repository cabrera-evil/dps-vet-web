'use client';

import {
	dashboardStats,
	type DashboardStat,
} from '@/components/dashboard/mocks/dashboard.mock';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointmentsToday } from '@/hooks/use-appointments-today';
import { CalendarClock } from 'lucide-react';

export function DashboardStats() {
	const today = useAppointmentsToday();
	const appointmentsStat: DashboardStat = {
		label: 'Citas hoy',
		value: today.total?.toString() ?? '—',
		description: today.isError
			? 'No se pudo cargar'
			: today.pending === undefined
				? ''
				: `${today.pending} pendientes de confirmar`,
		icon: CalendarClock,
	};
	const stats = [appointmentsStat, ...dashboardStats];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{stat.label}
						</CardTitle>
						<CardAction>
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<stat.icon className="size-4" />
							</div>
						</CardAction>
					</CardHeader>
					<CardContent>
						{stat === appointmentsStat && today.isLoading ? (
							<>
								<Skeleton className="h-8 w-16" />
								<Skeleton className="mt-1 h-4 w-32" />
							</>
						) : (
							<>
								<p className="text-2xl font-semibold tabular-nums">
									{stat.value}
								</p>
								<p className="text-xs text-muted-foreground">
									{stat.description}
								</p>
							</>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
