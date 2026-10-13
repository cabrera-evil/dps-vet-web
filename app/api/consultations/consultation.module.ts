import { RoleRepository } from '@/app/api/_shared/repository/role.repository';
import { AppointmentRepository } from '@/app/api/appointments/appointment.repository';
import { EncounterRepository } from '@/app/api/encounters/encounter.repository';
import { MedicationRepository } from '@/app/api/medications/medication.repository';
import { PetRepository } from '@/app/api/pets/pet.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { ConsultationController } from './consultation.controller';
import { ConsultationRepository } from './consultation.repository';
import { ConsultationService } from './consultation.service';

/**
 * Composition root for the consultations module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `consultationController`. Reads `clinical-encounters`, `pets`,
 * `appointments`, `users`, `roles` and `medications` read-only (ISP).
 */
const consultationRepository = new ConsultationRepository();
const encounterRepository = new EncounterRepository();
const petRepository = new PetRepository();
const appointmentRepository = new AppointmentRepository();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const medicationRepository = new MedicationRepository();
const service = new ConsultationService(
	consultationRepository,
	encounterRepository,
	petRepository,
	appointmentRepository,
	userRepository,
	roleRepository,
	medicationRepository
);

export const consultationController = new ConsultationController(service);
