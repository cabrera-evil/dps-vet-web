'use client';

import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import {
	AppointmentMock,
	appointmentsMock,
} from '@/components/appointments/mocks/appointments.mock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const STATUS_FILTERS: { label: string; value: AppointmentStatus | 'all' }[] = [
	{ label: 'Todas', value: 'all' },
	{ label: 'Pendientes', value: AppointmentStatus.PENDING },
	{ label: 'Confirmadas', value: AppointmentStatus.CONFIRMED },
	{ label: 'Atendidas', value: AppointmentStatus.ATTENDED },
	{ label: 'Canceladas', value: AppointmentStatus.CANCELLED },
];

function AppointmentsBlock({
	title,
	icon: Icon,
	appointments,
}: {
	title: string;
	icon: LucideIcon;
	appointments: AppointmentMock[];
}) {
	if (appointments.length === 0) return null;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Icon className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold">{title}</h3>
				<Badge variant="outline">{appointments.length}</Badge>
			</div>
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
				</TableBody>
			</Table>
		</div>
	);
}

export function AppointmentsTable() {
	const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>(
		'all'
	);
	const [search, setSearch] = useState('');

	const appointments = useMemo(() => {
		const term = search.trim().toLowerCase();
		return appointmentsMock.filter((item) => {
			const matchesStatus =
				statusFilter === 'all' || item.status === statusFilter;
			const matchesSearch =
				!term ||
				item.petName.toLowerCase().includes(term) ||
				item.clientName.toLowerCase().includes(term);
			return matchesStatus && matchesSearch;
		});
	}, [statusFilter, search]);

	const morning = useMemo(
		() => appointments.filter((item) => new Date(item.start).getHours() < 12),
		[appointments]
	);
	const afternoon = useMemo(
		() => appointments.filter((item) => new Date(item.start).getHours() >= 12),
		[appointments]
	);

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
					<div className="relative w-full sm:w-64">
						<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Buscar paciente o tutor..."
							className="pl-8"
						/>
					</div>
				</div>

				<AppointmentsBlock
					title="Bloque mañana"
					icon={Sunrise}
					appointments={morning}
				/>
				<AppointmentsBlock
					title="Bloque tarde"
					icon={Sunset}
					appointments={afternoon}
				/>
				{appointments.length === 0 && (
					<p className="py-6 text-center text-sm text-muted-foreground">
						No hay citas para este filtro.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
