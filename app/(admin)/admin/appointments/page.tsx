import { AppointmentsTable } from '@/components/appointments/appointments-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminAppointmentsPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">
						Agenda de Citas
					</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona las citas clínicas programadas.
					</p>
				</div>
				<Button>
					<Plus />
					Nueva cita
				</Button>
			</div>
			<AppointmentsTable />
		</div>
	);
}
