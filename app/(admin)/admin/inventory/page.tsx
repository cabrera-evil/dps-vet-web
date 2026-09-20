import { InventoryTable } from '@/components/inventory/inventory-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminInventoryPage() {
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
				<Button>
					<Plus />
					Nuevo medicamento
				</Button>
			</div>
			<InventoryTable />
		</div>
	);
}
