import { FollowUpControlRepository } from '@/app/api/consultations/follow-up-control.repository';
import { FollowUpRepository } from '@/app/api/consultations/follow-up.repository';
import { MedicationAdministrationRepository } from '@/app/api/medication-administrations/medication-administration.repository';
import { PetRepository } from '@/app/api/pets/pet.repository';
import { TreatmentPlanController } from './treatment-plan.controller';
import { TreatmentPlanRepository } from './treatment-plan.repository';
import { TreatmentPlanService } from './treatment-plan.service';

/**
 * Composition root for the treatment-plans module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `treatmentPlanController`. `pets` and `follow-ups` are read-only (ISP).
 */
export const treatmentPlanService = new TreatmentPlanService(
	new TreatmentPlanRepository(),
	new MedicationAdministrationRepository(),
	new PetRepository(),
	new FollowUpRepository(),
	new FollowUpControlRepository()
);

export const treatmentPlanController = new TreatmentPlanController(
	treatmentPlanService
);
