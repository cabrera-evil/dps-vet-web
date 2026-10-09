import { PetRepository } from '@/app/api/pets/pet.repository';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryRepository } from './medical-history.repository';
import { MedicalHistoryService } from './medical-history.service';

/**
 * Composition root for the medical-histories module — the only place
 * concrete classes are wired together. Route handlers import the ready
 * `medicalHistoryController`. Reads the `pets` repository read-only (ISP) to
 * confirm the patient exists.
 */
const medicalHistoryRepository = new MedicalHistoryRepository();
const petRepository = new PetRepository();
const service = new MedicalHistoryService(
	medicalHistoryRepository,
	petRepository
);

export const medicalHistoryController = new MedicalHistoryController(service);
