import {
	LOW_STOCK_THRESHOLD,
	medicationsMock,
} from '@/components/inventory/mocks/inventory.mock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export function InventoryTable() {
	return (
		<Card>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Medicamento</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className="text-right">Stock</TableHead>
							<TableHead className="text-right">Precio</TableHead>
							<TableHead className="text-right">Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{medicationsMock.map((medication) => (
							<TableRow key={medication.id}>
								<TableCell className="font-medium">{medication.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{medication.description}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{medication.stock}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									${medication.price.toFixed(2)} USD
								</TableCell>
								<TableCell className="text-right">
									{!medication.active ? (
										<Badge variant="secondary">Inactivo</Badge>
									) : medication.stock <= LOW_STOCK_THRESHOLD ? (
										<Badge variant="destructive">Stock bajo</Badge>
									) : (
										<Badge variant="default">Disponible</Badge>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
