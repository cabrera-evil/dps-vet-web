import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

export interface DashboardStat {
	label: string;
	value: string;
	description: string;
	icon: LucideIcon;
	isLoading?: boolean;
}

export function DashboardStatCard({
	label,
	value,
	description,
	icon: Icon,
	isLoading = false,
}: DashboardStat) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
				<CardAction>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Icon className="size-4" />
					</div>
				</CardAction>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<>
						<Skeleton className="h-8 w-16" />
						<Skeleton className="mt-1 h-4 w-32" />
					</>
				) : (
					<>
						<p className="text-2xl font-semibold tabular-nums">{value}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
					</>
				)}
			</CardContent>
		</Card>
	);
}
