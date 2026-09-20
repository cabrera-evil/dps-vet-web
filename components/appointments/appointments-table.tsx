'use client';

import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { appointmentsMock } from '@/components/appointments/mocks/appointments.mock';
import { Card, CardContent } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentStatus } from '@/constants/enum';
import { useMemo, useState } from 'react';

const STATUS_FILTERS: { label: string; value: AppointmentStatus | 'all' }[] = [
	{ label: 'Todas', value: 'all' },
	{ label: 'Pendientes', value: AppointmentStatus.PENDING },
	{ label: 'Confirmadas', value: AppointmentStatus.CONFIRMED },
	{ label: 'Atendidas', value: AppointmentStatus.ATTENDED },
	{ label: 'Canceladas', value: AppointmentStatus.CANCELLED },
];

export function AppointmentsTable() {
	const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>(
		'all'
	);

	const appointments = useMemo(
		() =>
			statusFilter === 'all'
				? appointmentsMock
				: appointmentsMock.filter((item) => item.status === statusFilter),
		[statusFilter]
	);

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<Tabs
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as AppointmentStatus | 'all')
					}
				>
					<TabsList>
						{STATUS_FILTERS.map((filter) => (
							<TabsTrigger key={filter.value} value={filter.value}>
								{filter.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Paciente</TableHead>
							<TableHead>Tutor</TableHead>
							<TableHead>Servicio</TableHead>
							<TableHead>Personal</TableHead>
							<TableHead>Fecha y hora</TableHead>
							<TableHead className="text-right">Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{appointments.map((appointment) => (
							<TableRow key={appointment.id}>
								<TableCell className="font-medium">
									{appointment.petName}
								</TableCell>
								<TableCell>{appointment.clientName}</TableCell>
								<TableCell>{appointment.serviceName}</TableCell>
								<TableCell>{appointment.staffName}</TableCell>
								<TableCell className="tabular-nums">
									{new Date(appointment.start).toLocaleString('es-SV', {
										dateStyle: 'medium',
										timeStyle: 'short',
									})}
								</TableCell>
								<TableCell className="text-right">
									<AppointmentStatusBadge status={appointment.status} />
								</TableCell>
							</TableRow>
						))}
						{appointments.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-sm text-muted-foreground"
								>
									No hay citas para este filtro.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
