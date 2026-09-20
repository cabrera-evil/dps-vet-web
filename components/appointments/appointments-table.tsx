'use client';

import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	NativeSelect,
	NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
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
import { queryClient } from '@/constants/environment';
import { useAppointmentDirectory } from '@/hooks/use-appointment-directory';
import { useDelete, useGet, usePatch } from '@/hooks/use-rest';
import { Appointment } from '@/types/appointment.type';
import { Search, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const STATUS_FILTERS: { label: string; value: AppointmentStatus | 'all' }[] = [
	{ label: 'Todas', value: 'all' },
	{ label: 'Pendientes', value: AppointmentStatus.PENDING },
	{ label: 'Confirmadas', value: AppointmentStatus.CONFIRMED },
	{ label: 'Atendidas', value: AppointmentStatus.ATTENDED },
	{ label: 'Canceladas', value: AppointmentStatus.CANCELLED },
];

/** Mirrors the fixed state machine in `appointment.service.ts` — the server
 * is the source of truth; this only limits which transitions are offered. */
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
	[AppointmentStatus.PENDING]: [
		AppointmentStatus.CONFIRMED,
		AppointmentStatus.CANCELLED,
	],
	[AppointmentStatus.CONFIRMED]: [
		AppointmentStatus.ATTENDED,
		AppointmentStatus.CANCELLED,
		AppointmentStatus.NO_SHOW,
	],
	[AppointmentStatus.ATTENDED]: [],
	[AppointmentStatus.CANCELLED]: [],
	[AppointmentStatus.NO_SHOW]: [],
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
	[AppointmentStatus.PENDING]: 'Pendiente',
	[AppointmentStatus.CONFIRMED]: 'Confirmar',
	[AppointmentStatus.ATTENDED]: 'Marcar atendida',
	[AppointmentStatus.CANCELLED]: 'Cancelar',
	[AppointmentStatus.NO_SHOW]: 'Marcar no asistió',
};

function invalidateAppointments() {
	return queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
}

function AppointmentActions({ appointment }: { appointment: Appointment }) {
	const { canManageAll } = useAppointmentDirectory();
	const { mutateAsync: updateStatus, isPending: isUpdating } = usePatch();
	const { mutateAsync: cancelAppointment, isPending: isCancelling } =
		useDelete();

	if (canManageAll) {
		const transitions = ALLOWED_TRANSITIONS[appointment.status];
		if (!transitions.length) return null;
		return (
			<NativeSelect
				size="sm"
				disabled={isUpdating}
				value=""
				onChange={async (event) => {
					const status = event.target.value as AppointmentStatus;
					if (!status) return;
					try {
						await updateStatus({
							path: `/api/appointments/${appointment.id}/status`,
							payload: { status },
						});
						await invalidateAppointments();
					} catch {
						// error toast handled by RestService interceptor
					}
				}}
			>
				<NativeSelectOption value="" disabled>
					Cambiar estado
				</NativeSelectOption>
				{transitions.map((status) => (
					<NativeSelectOption key={status} value={status}>
						{STATUS_LABEL[status]}
					</NativeSelectOption>
				))}
			</NativeSelect>
		);
	}

	const canCancel =
		[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(
			appointment.status
		) && new Date(appointment.start).getTime() > Date.now();
	if (!canCancel) return null;

	return (
		<Button
			size="sm"
			variant="outline"
			disabled={isCancelling}
			onClick={async () => {
				try {
					await cancelAppointment({
						path: `/api/appointments/${appointment.id}`,
					});
				} catch {
					return;
				}
				await invalidateAppointments();
				toast.success('Cita cancelada');
			}}
		>
			Cancelar
		</Button>
	);
}

function AppointmentsBlock({
	title,
	icon: Icon,
	appointments,
}: {
	title: string;
	icon: LucideIcon;
	appointments: Appointment[];
}) {
	const { getPetName, getServiceName, getUserName } = useAppointmentDirectory();
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
						<TableHead>Estado</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{appointments.map((appointment) => (
						<TableRow key={appointment.id}>
							<TableCell className="font-medium">
								{getPetName(appointment.petId)}
							</TableCell>
							<TableCell>{getUserName(appointment.clientId)}</TableCell>
							<TableCell>{getServiceName(appointment.serviceId)}</TableCell>
							<TableCell>
								{appointment.staffId
									? getUserName(appointment.staffId)
									: 'Sin asignar'}
							</TableCell>
							<TableCell className="tabular-nums">
								{new Date(appointment.start).toLocaleString('es-SV', {
									dateStyle: 'medium',
									timeStyle: 'short',
								})}
							</TableCell>
							<TableCell>
								<AppointmentStatusBadge status={appointment.status} />
							</TableCell>
							<TableCell className="text-right">
								<AppointmentActions appointment={appointment} />
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
	const { getPetName, getUserName } = useAppointmentDirectory();

	const { data: appointments, isLoading } = useGet<Appointment[]>({
		path: '/api/appointments',
		params: {
			pageSize: 100,
			status: statusFilter === 'all' ? undefined : statusFilter,
		},
	});

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return (appointments ?? []).filter((appointment) => {
			if (!term) return true;
			return (
				getPetName(appointment.petId).toLowerCase().includes(term) ||
				getUserName(appointment.clientId).toLowerCase().includes(term)
			);
		});
	}, [appointments, search, getPetName, getUserName]);

	const morning = useMemo(
		() => filtered.filter((item) => new Date(item.start).getHours() < 12),
		[filtered]
	);
	const afternoon = useMemo(
		() => filtered.filter((item) => new Date(item.start).getHours() >= 12),
		[filtered]
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

				{isLoading ? (
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				) : (
					<>
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
						{filtered.length === 0 && (
							<p className="py-6 text-center text-sm text-muted-foreground">
								No hay citas para este filtro.
							</p>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
