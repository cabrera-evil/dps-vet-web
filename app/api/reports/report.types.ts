import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { Medication } from '@/app/api/medications/medication.schema';
import type { AppointmentStatus } from '@/constants/enum';

export type AppointmentsReport = {
	total: number;
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

export type LowStockMedication = Pick<
	WithId<Medication>,
	'id' | 'name' | 'stock'
>;

export type LowStockReport = {
	count: number;
	items: LowStockMedication[];
};
