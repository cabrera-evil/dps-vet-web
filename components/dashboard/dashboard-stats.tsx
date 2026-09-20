import { dashboardStats } from '@/components/dashboard/mocks/dashboard.mock';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export function DashboardStats() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{dashboardStats.map((stat) => (
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
						<p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
						<p className="text-xs text-muted-foreground">{stat.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
