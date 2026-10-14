import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type {
	ApplicationUpdate,
	MedicationAdministrationRepository,
	ScheduledApplicationContext,
} from '@/app/api/medication-administrations/medication-administration.repository';
import type { User } from '@/app/api/users/user.schema';
import { ApplicationStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type {
	RegisterApplicationInput,
	SkipApplicationInput,
} from './treatment-plan.schema';
import type { TreatmentPlanService } from './treatment-plan.service';
import type { TreatmentPlanDetail } from './treatment-plan.types';

const differsFromOrder = (
	{ order }: ScheduledApplicationContext,
	input: RegisterApplicationInput
): boolean =>
	input.dose !== order.dose ||
	input.doseUnit !== order.doseUnit ||
	input.route !== order.route;

/**
 * Write side of applications: registers or skips a scheduled application.
 * Who administers always comes from the session, never from the client.
 * Staff only; depends on abstractions (DIP).
 */
export class TreatmentApplicationService {
	constructor(
		private readonly administrationRepo: MedicationAdministrationRepository,
		private readonly userRepo: FirestoreReadRepository<User>,
		private readonly planService: TreatmentPlanService
	) {}

	private async resolveStaffName(identity: Identity): Promise<string> {
		const user = await this.userRepo.findById(identity.uid);
		if (!user) throw new createHttpError.NotFound('Staff user not found');
		return user.name;
	}

	private async update(
		identity: Identity,
		planId: string,
		applicationId: string,
		buildUpdate: (context: ScheduledApplicationContext) => ApplicationUpdate
	): Promise<TreatmentPlanDetail> {
		await this.administrationRepo.updateScheduled(
			planId,
			applicationId,
			buildUpdate
		);
		return this.planService.getById(identity, planId);
	}

	async register(
		identity: Identity,
		planId: string,
		applicationId: string,
		input: RegisterApplicationInput
	): Promise<TreatmentPlanDetail> {
		assertClinicalStaff(identity);
		const administeredByName = await this.resolveStaffName(identity);
		const now = new Date().toISOString();

		return this.update(identity, planId, applicationId, (context) => {
			if (differsFromOrder(context, input) && !input.adjustmentReason)
				throw new createHttpError.UnprocessableEntity(
					'An adjustment reason is required when the dose, unit or route differ from the order'
				);
			return {
				status: ApplicationStatus.COMPLETED,
				administeredAt: input.administeredAt,
				administeredBy: identity.uid,
				administeredByName,
				actualDose: input.dose,
				actualDoseUnit: input.doseUnit,
				actualRoute: input.route,
				site: input.site,
				notes: input.notes,
				adjustmentReason: input.adjustmentReason,
				adverseReaction: input.adverseReaction,
				updatedAt: now,
				updatedBy: identity.uid,
			};
		});
	}

	async skip(
		identity: Identity,
		planId: string,
		applicationId: string,
		input: SkipApplicationInput
	): Promise<TreatmentPlanDetail> {
		assertClinicalStaff(identity);
		const now = new Date().toISOString();

		return this.update(identity, planId, applicationId, () => ({
			status: ApplicationStatus.SKIPPED,
			skipReason: input.reason,
			updatedAt: now,
			updatedBy: identity.uid,
		}));
	}
}
