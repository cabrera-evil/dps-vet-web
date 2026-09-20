import { PetRepository } from '@/app/api/pets/pet.repository';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordRepository } from './medical-record.repository';
import { MedicalRecordService } from './medical-record.service';

/**
 * Composition root for the medical-records module — the only place
 * concrete classes are wired together. Route handlers import the ready
 * `medicalRecordController`. Reads the `pets` repository read-only (ISP)
 * to enforce ownership.
 */
const medicalRecordRepository = new MedicalRecordRepository();
const petRepository = new PetRepository();
const service = new MedicalRecordService(
	medicalRecordRepository,
	petRepository
);

export const medicalRecordController = new MedicalRecordController(service);
