import { ServiceFormDialog } from '@/components/services/service-form-dialog';
import { ServicesGrid } from '@/components/services/services-grid';

export default function DashboardServicesPage() {
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
				<ServiceFormDialog mode="create" />
			</div>
			<ServicesGrid />
		</div>
	);
}
