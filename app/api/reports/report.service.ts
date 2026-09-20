import type { ReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { Appointment } from '@/app/api/appointments/appointment.schema';
import type { Order } from '@/app/api/orders/order.schema';
import { AppointmentStatus, OrderStatus } from '@/constants/enum';
import type {
	AppointmentsReportQuery,
	InventoryTurnoverQuery,
	PopularServicesQuery,
} from './report.schema';
import type {
	AppointmentsReport,
	InventoryTurnoverEntry,
	PopularServiceEntry,
} from './report.types';

const APPOINTMENT_STATUS_VALUES = Object.values(AppointmentStatus);

/**
 * Read-only aggregation over the `appointments`/`orders` collections — no
 * new collection is created for reporting. Firestore has limited
 * server-side aggregation, so counts are computed here from `findMany`
 * results rather than assuming a native group-by pipeline exists. Every
 * report requires a bounded `from`/`to` range (`report.schema.ts`) so a
 * caller can't force an unbounded collection scan. Depends only on
 * read-repository abstractions (DIP); concrete repositories are chosen in
 * `report.module.ts`.
 */
export class ReportService {
	constructor(
		private readonly appointmentRepo: ReadRepository<Appointment>,
		private readonly orderRepo: ReadRepository<Order>
	) {}

	async appointmentsReport(
		query: AppointmentsReportQuery
	): Promise<AppointmentsReport> {
		const appointments = await this.appointmentRepo.findMany({
			where: [
				{ field: 'start', op: '>=', value: query.from },
				{ field: 'start', op: '<=', value: query.to },
			],
		});

		const byStatus = Object.fromEntries(
			APPOINTMENT_STATUS_VALUES.map((status) => [status, 0])
		) as Record<AppointmentStatus, number>;
		const byDay: Record<string, number> = {};

		for (const appointment of appointments) {
			byStatus[appointment.status] += 1;
			const day = appointment.start.slice(0, 10);
			byDay[day] = (byDay[day] ?? 0) + 1;
		}

		return { byStatus, byDay };
	}

	async popularServices(
		query: PopularServicesQuery
	): Promise<PopularServiceEntry[]> {
		const appointments = await this.appointmentRepo.findMany({
			where: [
				{ field: 'start', op: '>=', value: query.from },
				{ field: 'start', op: '<=', value: query.to },
			],
		});
		const counts = new Map<string, number>();
		for (const appointment of appointments) {
			if (appointment.status === AppointmentStatus.CANCELLED) continue;
			counts.set(
				appointment.serviceId,
				(counts.get(appointment.serviceId) ?? 0) + 1
			);
		}

		return [...counts.entries()]
			.map(([serviceId, appointmentCount]) => ({ serviceId, appointmentCount }))
			.sort((a, b) => b.appointmentCount - a.appointmentCount);
	}

	async inventoryTurnover(
		query: InventoryTurnoverQuery
	): Promise<InventoryTurnoverEntry[]> {
		const orders = await this.orderRepo.findMany({
			where: [
				{ field: 'status', op: '==', value: OrderStatus.FULFILLED },
				{ field: 'createdAt', op: '>=', value: query.from },
				{ field: 'createdAt', op: '<=', value: query.to },
			],
		});
		const totals = new Map<string, number>();
		for (const order of orders) {
			for (const item of order.items) {
				totals.set(
					item.medicationId,
					(totals.get(item.medicationId) ?? 0) + item.quantity
				);
			}
		}

		return [...totals.entries()]
			.map(([medicationId, quantityFulfilled]) => ({
				medicationId,
				quantityFulfilled,
			}))
			.sort((a, b) => b.quantityFulfilled - a.quantityFulfilled);
	}
}
