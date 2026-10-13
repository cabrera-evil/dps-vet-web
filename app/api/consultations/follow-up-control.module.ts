import { MedicationRepository } from '@/app/api/medications/medication.repository';
import { treatmentPlanService } from '@/app/api/treatment-plans/treatment-plan.module';
import { TreatmentPlanRepository } from '@/app/api/treatment-plans/treatment-plan.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { FollowUpControlController } from './follow-up-control.controller';
import { FollowUpControlRepository } from './follow-up-control.repository';
import { FollowUpControlService } from './follow-up-control.service';
import { FollowUpRepository } from './follow-up.repository';

/**
 * Composition root for follow-up controls. Reuses the read service wired in
 * the treatment-plans module so responses match the plan endpoints;
 * `follow-ups`, `users`, `medications` and `treatment-plans` are read-only (ISP).
 */
const service = new FollowUpControlService(
	new FollowUpRepository(),
	new FollowUpControlRepository(),
	new TreatmentPlanRepository(),
	new UserRepository(),
	new MedicationRepository(),
	treatmentPlanService
);

export const followUpControlController = new FollowUpControlController(service);
