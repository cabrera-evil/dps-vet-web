import { ServicesGrid } from '@/components/services/services-grid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminServicesPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">
						Servicios Clínicos
					</h2>
					<p className="text-sm text-muted-foreground">
						Catálogo de servicios ofrecidos por la clínica.
					</p>
				</div>
				<Button>
					<Plus />
					Nuevo servicio
				</Button>
			</div>
			<ServicesGrid />
		</div>
	);
}
