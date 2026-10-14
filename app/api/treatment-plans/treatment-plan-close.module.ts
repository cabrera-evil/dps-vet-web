import { TreatmentPlanCloseController } from './treatment-plan-close.controller';
import { TreatmentPlanCloseService } from './treatment-plan-close.service';
import { treatmentPlanService } from './treatment-plan.module';
import { TreatmentPlanRepository } from './treatment-plan.repository';

/**
 * Composition root for closing a plan. Reuses the read service wired in the
 * treatment-plans module so the response matches the GET endpoints.
 */
const service = new TreatmentPlanCloseService(
	new TreatmentPlanRepository(),
	treatmentPlanService
);

export const treatmentPlanCloseController = new TreatmentPlanCloseController(
	service
);
