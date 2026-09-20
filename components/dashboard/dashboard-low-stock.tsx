import { dashboardLowStockMedications } from '@/components/dashboard/mocks/dashboard.mock';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export function DashboardLowStock() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Inventario bajo</CardTitle>
				<CardDescription>Medicamentos por reabastecer</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{dashboardLowStockMedications.map((medication) => (
					<div
						key={medication.id}
						className="flex items-center justify-between"
					>
						<span className="text-sm">{medication.name}</span>
						<Badge variant="destructive">{medication.stock} u.</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
