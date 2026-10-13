import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import { closePlanWrites } from './treatment-plan.builder';
import type { TreatmentPlanRepository } from './treatment-plan.repository';
import type { CloseTreatmentInput } from './treatment-plan.schema';
import type { TreatmentPlanService } from './treatment-plan.service';
import type { TreatmentPlanDetail } from './treatment-plan.types';

/**
 * Closes a treatment plan (complete, suspend or cancel). The rules live in
 * `closePlanWrites`; the repository applies them atomically. Staff only.
 */
export class TreatmentPlanCloseService {
	constructor(
		private readonly planRepo: Pick<TreatmentPlanRepository, 'closeOpenPlan'>,
		private readonly planService: TreatmentPlanService
	) {}

	async close(
		identity: Identity,
		planId: string,
		input: CloseTreatmentInput
	): Promise<TreatmentPlanDetail> {
		assertClinicalStaff(identity);
		const now = new Date().toISOString();
		const staff = { id: identity.uid, name: '' };

		await this.planRepo.closeOpenPlan(planId, ({ plan, administrations }) =>
			closePlanWrites(plan, administrations, input, { staff, now })
		);
		return this.planService.getById(identity, planId);
	}
}
