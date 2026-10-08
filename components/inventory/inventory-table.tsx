'use client';

import { MedicationFormDialog } from '@/components/inventory/medication-form-dialog';
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
import { Permission } from '@/constants/permission';
import { useGet } from '@/hooks/use-rest';
import { Medication } from '@/types/medication.type';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';

export function InventoryTable() {
	const { data: session } = useSession();
	const canWrite = hasPermission(session?.user?.permissions, [
		Permission.MEDICATIONS_WRITE,
	]);
	const columnCount = canWrite ? 6 : 5;
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
							{canWrite && (
								<TableHead className="text-right">Acciones</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableSkeletonRows columnCount={columnCount} />
						) : (
							<>
								{(medications ?? []).map((medication) => (
									<TableRow key={medication.id}>
										<TableCell className="font-medium">
											{medication.name}
										</TableCell>
										<TableCell
											className="max-w-xs truncate text-muted-foreground"
											title={medication.description}
										>
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
										{canWrite && (
											<TableCell className="text-right">
												<MedicationFormDialog
													mode="edit"
													medication={medication}
												/>
											</TableCell>
										)}
									</TableRow>
								))}
								{!medications?.length && (
									<TableRow>
										<TableCell
											colSpan={columnCount}
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
