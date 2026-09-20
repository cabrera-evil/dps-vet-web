import { AppointmentStatus } from '@/constants/enum';
import { z } from 'zod';

export const appointmentSchema = z.object({
	clientId: z.string().min(1),
	petId: z.string().min(1),
	serviceId: z.string().min(1),
	staffId: z.string().min(1).optional(),
	start: z.string(),
	end: z.string(),
	status: z.nativeEnum(AppointmentStatus),
	createdAt: z.string(),
});

/**
 * Booking payload — `end`/`status`/`createdAt` are always set server-side.
 * `clientId`/`staffId` are only honored when the caller has
 * `Permission.APPOINTMENTS_MANAGE_ALL` (staff booking on a client's
 * behalf); a plain client caller's `clientId` is always their own uid and
 * any `staffId` they send is ignored — see `appointment.service.ts#create`.
 */
export const createAppointmentSchema = appointmentSchema
	.pick({ petId: true, serviceId: true, start: true })
	.extend({
		clientId: z.string().min(1).optional(),
		staffId: z.string().min(1).optional(),
	});

export const updateAppointmentStatusSchema = z.object({
	status: z.nativeEnum(AppointmentStatus),
});

export const listAppointmentsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.nativeEnum(AppointmentStatus).optional(),
	clientId: z.string().optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<
	typeof updateAppointmentStatusSchema
>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
