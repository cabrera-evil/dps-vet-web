import { AppointmentStatus } from '@/constants/enum';

export interface Appointment {
	id: string;
	clientId: string;
	petId: string;
	serviceId: string;
	staffId?: string;
	start: string;
	end: string;
	status: AppointmentStatus;
	createdAt: string;
}

export interface CreateAppointmentPayload {
	petId: string;
	serviceId: string;
	start: string;
}

export interface AppointmentPet {
	id: string;
	name: string;
	species: string;
}

export interface AppointmentService {
	id: string;
	name: string;
	durationMinutes: number;
	price: number;
}

export interface AppointmentClient {
	id: string;
	name: string;
}
