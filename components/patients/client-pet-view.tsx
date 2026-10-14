'use client';

import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { ClinicalDataList } from '@/components/clinical/clinical-data-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PET_SEX_LABEL } from '@/constants/clinical';
import { useAppointmentDirectory } from '@/hooks/use-appointment-directory';
import { useGet } from '@/hooks/use-rest';
import type { Appointment } from '@/types/appointment.type';
import type { Pet } from '@/types/pet.type';
import { getAgeLabel } from '@/utils/age';
import { formatDate } from '@/utils/date';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { PatientRecordNotice } from './patient-record-notice';
import { PatientRecordSkeleton } from './patient-record-skeleton';

/**
 * Pet page for users without clinical access: basic pet data and the pet's
 * appointments only. Reads `/pets/:id` and `/appointments`, never clinical endpoints.
 */
export function ClientPetView({ patientId }: { patientId: string }) {
	const pet = useGet<Pet>({ path: `/pets/${patientId}` });
	const appointments = useGet<Appointment[]>({
		path: '/appointments',
		params: { petId: patientId, pageSize: 100 },
	});
	const { getServiceName } = useAppointmentDirectory();

	if (pet.isLoading) return <PatientRecordSkeleton />;
	if (pet.error || !pet.data)
		return (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar la mascota"
				description="Es posible que el enlace sea incorrecto o que ocurriera un problema. Intenta nuevamente."
			/>
		);

	const { name, species, breed, sex, birthDate, color, markings, microchip } =
		pet.data;

	return (
		<div className="flex flex-col gap-6">
			<Button
				variant="ghost"
				size="sm"
				className="-ml-2 w-fit"
				nativeButton={false}
				render={<Link href="/dashboard/patients" />}
			>
				<ArrowLeft />
				Mis Mascotas
			</Button>
			<h2 className="font-heading text-xl font-semibold">{name}</h2>
			<Card>
				<CardHeader>
					<CardTitle>Datos de la mascota</CardTitle>
				</CardHeader>
				<CardContent>
					<ClinicalDataList
						items={[
							{ label: 'Especie', value: species },
							{ label: 'Raza', value: breed },
							{ label: 'Sexo', value: sex && PET_SEX_LABEL[sex] },
							{ label: 'Fecha de nacimiento', value: formatDate(birthDate) },
							{ label: 'Edad', value: getAgeLabel(birthDate) },
							{ label: 'Color', value: color },
							{ label: 'Señas particulares', value: markings },
							{ label: 'Microchip / identificación', value: microchip },
						]}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Citas</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					{appointments.isLoading && <Skeleton className="h-8 w-full" />}
					{appointments.data?.length === 0 && (
						<p className="text-sm text-muted-foreground">
							Esta mascota no tiene citas.
						</p>
					)}
					{appointments.data?.map((appointment) => (
						<div
							key={appointment.id}
							className="flex items-center justify-between gap-2 text-sm"
						>
							<span>
								{getServiceName(appointment.serviceId)} ·{' '}
								{new Date(appointment.start).toLocaleString('es-SV', {
									dateStyle: 'medium',
									timeStyle: 'short',
								})}
							</span>
							<AppointmentStatusBadge status={appointment.status} />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
