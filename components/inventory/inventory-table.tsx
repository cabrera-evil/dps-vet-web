'use client';

import { TableSkeletonRows } from '@/components/table/table-skeleton-rows';
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
import { useGet } from '@/hooks/use-rest';
import { Medication } from '@/types/medication.type';

const COLUMN_COUNT = 5;

export function InventoryTable() {
	const { data: medications, isLoading } = useGet<Medication[]>({
		path: '/medications',
		params: { pageSize: 100 },
	});

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
						{isLoading ? (
							<TableSkeletonRows columnCount={COLUMN_COUNT} />
						) : (
							<>
								{(medications ?? []).map((medication) => (
									<TableRow key={medication.id}>
										<TableCell className="font-medium">
											{medication.name}
										</TableCell>
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
											<Badge
												variant={medication.active ? 'default' : 'secondary'}
											>
												{medication.active ? 'Disponible' : 'Inactivo'}
											</Badge>
										</TableCell>
									</TableRow>
								))}
								{!medications?.length && (
									<TableRow>
										<TableCell
											colSpan={COLUMN_COUNT}
											className="text-center text-sm text-muted-foreground"
										>
											No hay medicamentos registrados.
										</TableCell>
									</TableRow>
								)}
							</>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
