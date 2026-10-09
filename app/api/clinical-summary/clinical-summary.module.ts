import { ClinicalMeasurementRepository } from '@/app/api/consultations/clinical-measurement.repository';
import { DiagnosisRepository } from '@/app/api/consultations/diagnosis.repository';
import { FollowUpRepository } from '@/app/api/consultations/follow-up.repository';
import { EncounterRepository } from '@/app/api/encounters/encounter.repository';
import { MedicalHistoryRepository } from '@/app/api/medical-histories/medical-history.repository';
import { PetRepository } from '@/app/api/pets/pet.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { ClinicalSummaryController } from './clinical-summary.controller';
import { ClinicalSummaryService } from './clinical-summary.service';

/**
 * Composition root for the clinical-summary module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `clinicalSummaryController`. Every repository is used read-only (ISP).
 */
const service = new ClinicalSummaryService(
	new PetRepository(),
	new UserRepository(),
	new MedicalHistoryRepository(),
	new EncounterRepository(),
	new ClinicalMeasurementRepository(),
	new DiagnosisRepository(),
	new FollowUpRepository()
);

export const clinicalSummaryController = new ClinicalSummaryController(service);
