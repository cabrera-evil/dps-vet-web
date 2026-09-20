import { PetRepository } from '@/app/api/pets/pet.repository';
import { ServiceRepository } from '@/app/api/services/service.repository';
import { AppointmentController } from './appointment.controller';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentService } from './appointment.service';

/**
 * Composition root for the appointments module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `appointmentController`. Reads the `pets`/`services` repositories
 * read-only (ISP) to validate ownership and resolve slot duration.
 */
const appointmentRepository = new AppointmentRepository();
const petRepository = new PetRepository();
const serviceRepository = new ServiceRepository();
const service = new AppointmentService(
	appointmentRepository,
	petRepository,
	serviceRepository
);

export const appointmentController = new AppointmentController(service);
