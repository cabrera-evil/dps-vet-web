import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { dashboardUpcomingAppointments } from '@/components/dashboard/mocks/dashboard.mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export function DashboardUpcomingAppointments() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Próximas citas</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Paciente</TableHead>
							<TableHead>Tutor</TableHead>
							<TableHead>Servicio</TableHead>
							<TableHead>Hora</TableHead>
							<TableHead className="text-right">Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dashboardUpcomingAppointments.map((appointment) => (
							<TableRow key={appointment.id}>
								<TableCell className="font-medium">
									{appointment.petName}
								</TableCell>
								<TableCell>{appointment.clientName}</TableCell>
								<TableCell>{appointment.serviceName}</TableCell>
								<TableCell className="tabular-nums">
									{new Date(appointment.start).toLocaleTimeString('es-SV', {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</TableCell>
								<TableCell className="text-right">
									<AppointmentStatusBadge status={appointment.status} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
