import type { AppointmentStatus } from '@/constants/enum';

export type AppointmentsReport = {
	byStatus: Record<AppointmentStatus, number>;
	byDay: Record<string, number>;
};

export type PopularServiceEntry = {
	serviceId: string;
	appointmentCount: number;
};

export type InventoryTurnoverEntry = {
	medicationId: string;
	quantityFulfilled: number;
};
