import { ClientsTable } from '@/components/clients/clients-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminClientsPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">
						Clientes y Tutores
					</h2>
					<p className="text-sm text-muted-foreground">
						Tutores registrados y sus mascotas asociadas.
					</p>
				</div>
				<Button>
					<Plus />
					Nuevo tutor
				</Button>
			</div>
			<ClientsTable />
		</div>
	);
}
