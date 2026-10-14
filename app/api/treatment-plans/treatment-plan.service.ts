import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { FollowUpControlRepository } from '@/app/api/consultations/follow-up-control.repository';
import type { FollowUp } from '@/app/api/consultations/follow-up.schema';
import type { MedicationAdministrationRepository } from '@/app/api/medication-administrations/medication-administration.repository';
import type { Pet } from '@/app/api/pets/pet.schema';
import type { TreatmentFollowUp } from '@/types/treatment.type';
import createHttpError from 'http-errors';
import { toControlRecord, toTreatmentPlan } from './treatment-plan.mapper';
import type { TreatmentPlanRepository } from './treatment-plan.repository';
import type { TreatmentPlanDocument } from './treatment-plan.schema';
import type { TreatmentPlanDetail } from './treatment-plan.types';

const CONTROLS_LIMIT = 20;

const toFollowUp = ({
	id,
	recommendedDate,
	reason,
	status,
}: WithId<FollowUp>): TreatmentFollowUp => ({
	id,
	recommendedDate,
	reason,
	status,
});

/**
 * Read side of treatment plans: assembles each stored plan with its
 * applications, follow-up and controls into the shape the UI consumes.
 * Staff only; depends on repository abstractions (DIP).
 */
export class TreatmentPlanService {
	constructor(
		private readonly planRepo: TreatmentPlanRepository,
		private readonly administrationRepo: MedicationAdministrationRepository,
		private readonly petRepo: FirestoreReadRepository<Pet>,
		private readonly followUpRepo: FirestoreReadRepository<FollowUp>,
		private readonly controlRepo: FollowUpControlRepository
	) {}

	async assemblePlans(
		petId: string,
		plans: WithId<TreatmentPlanDocument>[]
	): Promise<TreatmentPlanDetail[]> {
		if (plans.length === 0) return [];
		const followUpIds = [
			...new Set(plans.flatMap(({ followUpId }) => followUpId ?? [])),
		];

		const [administrations, followUps, controls] = await Promise.all([
			this.administrationRepo.findByPlans(plans.map(({ id }) => id)),
			Promise.all(followUpIds.map((id) => this.followUpRepo.findById(id))),
			this.controlRepo.findByPet(petId, CONTROLS_LIMIT),
		]);
		const followUpsById = new Map(
			followUps.flatMap((followUp) =>
				followUp ? [[followUp.id, toFollowUp(followUp)] as const] : []
			)
		);

		return plans.map((plan) =>
			toTreatmentPlan(
				{ id: plan.id, data: plan },
				administrations.map((administration) => ({
					id: administration.id,
					data: administration,
				})),
				{
					followUp: plan.followUpId
						? followUpsById.get(plan.followUpId)
						: undefined,
					controls: controls
						.filter((control) => control.treatmentPlanIds.includes(plan.id))
						.map((control) => toControlRecord(control, plan.id)),
				}
			)
		);
	}

	async listByPet(
		identity: Identity,
		petId: string
	): Promise<TreatmentPlanDetail[]> {
		assertClinicalStaff(identity);
		if (!(await this.petRepo.exists(petId)))
			throw new createHttpError.NotFound('Pet not found');
		return this.assemblePlans(petId, await this.planRepo.findByPet(petId));
	}

	async getById(identity: Identity, id: string): Promise<TreatmentPlanDetail> {
		assertClinicalStaff(identity);
		const plan = await this.planRepo.findById(id);
		if (!plan) throw new createHttpError.NotFound('Treatment plan not found');
		const [detail] = await this.assemblePlans(plan.petId, [plan]);
		return detail;
	}
}
