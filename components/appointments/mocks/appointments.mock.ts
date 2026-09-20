import { AppointmentStatus } from '@/constants/enum';

export interface AppointmentMock {
	id: string;
	petName: string;
	clientName: string;
	serviceName: string;
	staffName: string;
	start: string;
	end: string;
	status: AppointmentStatus;
}

export const appointmentsMock: AppointmentMock[] = [
	{
		id: 'apt-1',
		petName: 'Max',
		clientName: 'Ana Martínez',
		serviceName: 'Consulta general',
		staffName: 'Dra. Gómez',
		start: '2026-09-19T09:00:00-06:00',
		end: '2026-09-19T09:30:00-06:00',
		status: AppointmentStatus.CONFIRMED,
	},
	{
		id: 'apt-2',
		petName: 'Luna',
		clientName: 'Carlos Hernández',
		serviceName: 'Vacunación',
		staffName: 'Dr. Alvarado',
		start: '2026-09-19T09:30:00-06:00',
		end: '2026-09-19T10:00:00-06:00',
		status: AppointmentStatus.PENDING,
	},
	{
		id: 'apt-3',
		petName: 'Rocky',
		clientName: 'Fátima López',
		serviceName: 'Cirugía menor',
		staffName: 'Dra. Gómez',
		start: '2026-09-19T10:30:00-06:00',
		end: '2026-09-19T11:30:00-06:00',
		status: AppointmentStatus.CONFIRMED,
	},
	{
		id: 'apt-4',
		petName: 'Michi',
		clientName: 'José Ramírez',
		serviceName: 'Control post-operatorio',
		staffName: 'Dr. Alvarado',
		start: '2026-09-19T11:00:00-06:00',
		end: '2026-09-19T11:20:00-06:00',
		status: AppointmentStatus.PENDING,
	},
	{
		id: 'apt-5',
		petName: 'Toby',
		clientName: 'Marta Cruz',
		serviceName: 'Baño y peluquería',
		staffName: 'Téc. Reyes',
		start: '2026-09-18T15:00:00-06:00',
		end: '2026-09-18T16:00:00-06:00',
		status: AppointmentStatus.ATTENDED,
	},
	{
		id: 'apt-6',
		petName: 'Kira',
		clientName: 'Pedro Salinas',
		serviceName: 'Desparasitación',
		staffName: 'Dra. Gómez',
		start: '2026-09-18T14:00:00-06:00',
		end: '2026-09-18T14:20:00-06:00',
		status: AppointmentStatus.NO_SHOW,
	},
	{
		id: 'apt-7',
		petName: 'Simón',
		clientName: 'Laura Peña',
		serviceName: 'Consulta general',
		staffName: 'Dr. Alvarado',
		start: '2026-09-17T10:00:00-06:00',
		end: '2026-09-17T10:30:00-06:00',
		status: AppointmentStatus.CANCELLED,
	},
];
