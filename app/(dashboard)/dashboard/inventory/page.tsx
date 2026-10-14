import { InventoryTable } from '@/components/inventory/inventory-table';
import { MedicationFormDialog } from '@/components/inventory/medication-form-dialog';

export default function DashboardInventoryPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">
						Inventario y Medicamentos
					</h2>
					<p className="text-sm text-muted-foreground">
						Control de existencias de medicamentos e insumos.
					</p>
				</div>
				<MedicationFormDialog mode="create" />
			</div>
			<InventoryTable />
		</div>
	);
}
