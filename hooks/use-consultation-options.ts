import { AppointmentStatus } from '@/constants/enum';
import { RoleName } from '@/constants/roles';
import { useGet } from '@/hooks/use-rest';
import type {
	Appointment,
	AppointmentClient,
	AppointmentService,
} from '@/types/appointment.type';
import type { CatalogEntry } from '@/types/catalog.type';
import type { ConsultationOption } from '@/types/consultation.type';
import { formatDate, formatTime } from '@/utils/date';
import { useMemo } from 'react';

/** Appointments of one patient, labelled for a select (cancelled ones excluded). */
export function useAppointmentOptions(patientId: string, enabled = true) {
	const { data: appointments } = useGet<Appointment[]>(
		{ path: '/appointments', params: { petId: patientId, pageSize: 20 } },
		{ enabled }
	);
	const { data: services } = useGet<AppointmentService[]>(
		{ path: '/services', params: { pageSize: 100 } },
		{ enabled }
	);

	return useMemo<ConsultationOption[]>(() => {
		const serviceNames = new Map(
			(services ?? []).map((service) => [service.id, service.name])
		);
		return (appointments ?? [])
			.filter(
				(appointment) => appointment.status !== AppointmentStatus.CANCELLED
			)
			.map((appointment) => ({
				id: appointment.id,
				label: [
					formatDate(appointment.start),
					formatTime(appointment.start),
					serviceNames.get(appointment.serviceId) ?? 'Cita',
				].join(' · '),
			}));
	}, [appointments, services]);
}

/** Lookups behind the consultation form: veterinarians, appointments and diagnoses. */
export function useConsultationOptions(patientId: string) {
	const { data: employees } = useGet<AppointmentClient[]>({
		path: '/users',
		params: { role: RoleName.EMPLEADO, pageSize: 100 },
	});
	const { data: administrators } = useGet<AppointmentClient[]>({
		path: '/users',
		params: { role: RoleName.ADMINISTRADOR, pageSize: 100 },
	});
	const { data: diagnosisCatalog } = useGet<CatalogEntry[]>({
		path: '/diagnosis-catalog',
	});
	const appointments = useAppointmentOptions(patientId);

	const staff = useMemo<ConsultationOption[]>(
		() =>
			[...(employees ?? []), ...(administrators ?? [])].map((user) => ({
				id: user.id,
				label: user.name,
			})),
		[employees, administrators]
	);
	const diagnoses = useMemo(
		() => (diagnosisCatalog ?? []).map((entry) => entry.name),
		[diagnosisCatalog]
	);

	return { staff, appointments, diagnoses };
}
