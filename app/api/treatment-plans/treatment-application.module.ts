import { MedicationAdministrationRepository } from '@/app/api/medication-administrations/medication-administration.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { TreatmentApplicationController } from './treatment-application.controller';
import { TreatmentApplicationService } from './treatment-application.service';
import { treatmentPlanService } from './treatment-plan.module';

/**
 * Composition root for application mutations. Reuses the read service wired
 * in the treatment-plans module so responses match the GET endpoints;
 * `users` is read-only (ISP).
 */
const service = new TreatmentApplicationService(
	new MedicationAdministrationRepository(),
	new UserRepository(),
	treatmentPlanService
);

export const treatmentApplicationController =
	new TreatmentApplicationController(service);
