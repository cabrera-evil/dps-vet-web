import { dashboardLowStockMedications } from '@/components/dashboard/mocks/dashboard.mock';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Pill } from 'lucide-react';

export function DashboardLowStock() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Farmacia crítica</CardTitle>
				<CardDescription>Medicamentos por reabastecer</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{dashboardLowStockMedications.map((medication) => (
					<div
						key={medication.id}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
								<Pill className="size-4" />
							</div>
							<span className="text-sm">{medication.name}</span>
						</div>
						<Badge variant="destructive">{medication.stock} u.</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
