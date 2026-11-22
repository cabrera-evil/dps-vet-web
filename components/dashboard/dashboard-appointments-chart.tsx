'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointmentsReport } from '@/hooks/use-appointments-report';
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from 'recharts';

const chartConfig = {
	count: { label: 'Citas', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function formatDay(day: string) {
	return new Date(`${day}T00:00:00Z`).toLocaleDateString('es-SV', {
		weekday: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}

export function DashboardAppointmentsChart() {
	const { byDay, total, isLoading, isError } = useAppointmentsReport();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Citas de la última semana</CardTitle>
				<CardDescription>Citas agendadas por día</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <Skeleton className="h-56 w-full" />}
				{!isLoading && isError && (
					<p className="text-sm text-muted-foreground">No se pudo cargar.</p>
				)}
				{!isLoading && !isError && total === 0 && (
					<p className="text-sm text-muted-foreground">Sin datos.</p>
				)}
				{!isLoading && !isError && total > 0 && (
					<ChartContainer
						config={chartConfig}
						className="h-56 w-full"
						role="img"
						aria-label={`Gráfica de barras: ${total} citas en los últimos 7 días`}
					>
						<BarChart data={byDay} margin={{ top: 16 }}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="day"
								tickLine={false}
								axisLine={false}
								tickFormatter={formatDay}
							/>
							<YAxis hide allowDecimals={false} />
							<ChartTooltip
								content={
									<ChartTooltipContent
										labelFormatter={(label) => formatDay(String(label))}
									/>
								}
							/>
							<Bar dataKey="count" fill="var(--color-count)" radius={4}>
								<LabelList
									dataKey="count"
									position="top"
									className="fill-foreground"
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
