import { AppointmentBoxAvailability } from '@/components/appointments/appointment-box-availability';
import { AppointmentFormDialog } from '@/components/appointments/appointment-form-dialog';
import { AppointmentsTable } from '@/components/appointments/appointments-table';

export default function DashboardAppointmentsPage() {
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
				<AppointmentFormDialog />
			</div>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<AppointmentsTable />
				</div>
				<AppointmentBoxAvailability />
			</div>
		</div>
	);
}
