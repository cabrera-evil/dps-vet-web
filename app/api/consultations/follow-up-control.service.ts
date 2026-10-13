import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { Medication } from '@/app/api/medications/medication.schema';
import { toControlRecord } from '@/app/api/treatment-plans/treatment-plan.mapper';
import type { TreatmentPlanRepository } from '@/app/api/treatment-plans/treatment-plan.repository';
import type { TreatmentPlanService } from '@/app/api/treatment-plans/treatment-plan.service';
import type { User } from '@/app/api/users/user.schema';
import { FollowUpStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import {
	buildControlWrites,
	CONTROL_ALREADY_REGISTERED_MESSAGE,
} from './follow-up-control.builder';
import type { FollowUpControlRepository } from './follow-up-control.repository';
import type { RegisterControlInput } from './follow-up-control.schema';
import type {
	FollowUpControlDetail,
	FollowUpDetail,
} from './follow-up-control.types';
import type { FollowUp } from './follow-up.schema';

const toFollowUpDetail = ({
	id,
	petId,
	sourceEncounterId,
	recommendedDate,
	reason,
	status,
}: WithId<FollowUp>): FollowUpDetail => ({
	id,
	petId,
	sourceConsultationId: sourceEncounterId,
	recommendedDate,
	reason,
	status,
});

const distinctMedicationIds = (input: RegisterControlInput): string[] => [
	...new Set(
		input.decisions.flatMap((decision) =>
			decision.decision === 'MODIFY'
				? decision.medications.map(({ medicationId }) => medicationId)
				: []
		)
	),
];

/**
 * Reads a follow-up with its treatment plans and registers its control.
 * The rules live in `buildControlWrites`; the repository applies them
 * atomically. Staff only; depends on abstractions (DIP).
 */
export class FollowUpControlService {
	constructor(
		private readonly followUpRepo: FirestoreReadRepository<FollowUp>,
		private readonly controlRepo: Pick<
			FollowUpControlRepository,
			'findLatestByPet' | 'registerControl'
		>,
		private readonly planRepo: Pick<TreatmentPlanRepository, 'findByFollowUp'>,
		private readonly userRepo: FirestoreReadRepository<User>,
		private readonly medicationRepo: FirestoreReadRepository<Medication>,
		private readonly planService: TreatmentPlanService
	) {}

	/** Every medication of a MODIFY decision must exist and be active; returns id -> name. */
	private async resolveMedicationNames(
		input: RegisterControlInput
	): Promise<ReadonlyMap<string, string>> {
		const entries = await Promise.all(
			distinctMedicationIds(input).map(async (medicationId) => {
				const medication = await this.medicationRepo.findById(medicationId);
				if (!medication?.active)
					throw new createHttpError.UnprocessableEntity(
						`Medication not available: ${medicationId}`
					);
				return [medicationId, medication.name] as const;
			})
		);
		return new Map(entries);
	}

	async get(
		identity: Identity,
		followUpId: string
	): Promise<FollowUpControlDetail> {
		assertClinicalStaff(identity);
		const followUp = await this.followUpRepo.findById(followUpId);
		if (!followUp) throw new createHttpError.NotFound('Follow-up not found');

		const [plans, lastControl] = await Promise.all([
			this.planRepo.findByFollowUp(followUpId),
			this.controlRepo.findLatestByPet(followUp.petId),
		]);
		return {
			followUp: toFollowUpDetail(followUp),
			plans: await this.planService.assemblePlans(followUp.petId, plans),
			lastControl: lastControl ? toControlRecord(lastControl) : undefined,
		};
	}

	async register(
		identity: Identity,
		followUpId: string,
		input: RegisterControlInput
	): Promise<FollowUpControlDetail> {
		assertClinicalStaff(identity);
		const followUp = await this.followUpRepo.findById(followUpId);
		if (!followUp) throw new createHttpError.NotFound('Follow-up not found');
		if (followUp.status !== FollowUpStatus.PENDING)
			throw new createHttpError.Conflict(CONTROL_ALREADY_REGISTERED_MESSAGE);
		const user = await this.userRepo.findById(identity.uid);
		if (!user) throw new createHttpError.NotFound('Staff user not found');
		const medicationNames = await this.resolveMedicationNames(input);
		const now = new Date().toISOString();
		const staff = { id: identity.uid, name: user.name };

		await this.controlRepo.registerControl(followUpId, (snapshot) =>
			buildControlWrites(snapshot, input, {
				followUpId,
				staff,
				now,
				medicationNames,
			})
		);
		return this.get(identity, followUpId);
	}
}
