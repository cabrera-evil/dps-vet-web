import { AppointmentRepository } from '@/app/api/appointments/appointment.repository';
import { MedicationRepository } from '@/app/api/medications/medication.repository';
import { OrderRepository } from '@/app/api/orders/order.repository';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

/**
 * Composition root for the reports module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `reportController`. Reads the `appointments`/`orders`/`medications` repositories
 * read-only (ISP); no `reports` collection exists.
 */
const appointmentRepository = new AppointmentRepository();
const orderRepository = new OrderRepository();
const medicationRepository = new MedicationRepository();
const service = new ReportService(
	appointmentRepository,
	orderRepository,
	medicationRepository
);

export const reportController = new ReportController(service);
