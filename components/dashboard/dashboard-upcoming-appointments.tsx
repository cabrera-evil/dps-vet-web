'use client';

import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { AppointmentStatus } from '@/constants/enum';
import { useAppointmentDirectory } from '@/hooks/use-appointment-directory';
import { useGet } from '@/hooks/use-rest';
import { Appointment } from '@/types/appointment.type';
import { useMemo } from 'react';

const UPCOMING_STATUSES = new Set<AppointmentStatus>([
	AppointmentStatus.PENDING,
	AppointmentStatus.CONFIRMED,
]);

export function DashboardUpcomingAppointments() {
	const { getPetName, getServiceName, getUserName } = useAppointmentDirectory();
	const { data: appointments, isLoading } = useGet<Appointment[]>({
		path: '/appointments',
		params: { pageSize: 100 },
	});

	const upcoming = useMemo(() => {
		const now = Date.now();
		return (appointments ?? [])
			.filter(
				(appointment) =>
					UPCOMING_STATUSES.has(appointment.status) &&
					new Date(appointment.start).getTime() >= now
			)
			.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
			.slice(0, 5);
	}, [appointments]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Próximas citas</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				) : (
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
							{upcoming.map((appointment) => (
								<TableRow key={appointment.id}>
									<TableCell className="font-medium">
										{getPetName(appointment.petId)}
									</TableCell>
									<TableCell>{getUserName(appointment.clientId)}</TableCell>
									<TableCell>{getServiceName(appointment.serviceId)}</TableCell>
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
							{upcoming.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-sm text-muted-foreground"
									>
										No hay citas próximas.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
