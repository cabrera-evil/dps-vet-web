import {
	ALREADY_CLOSED_MESSAGE,
	MODIFIED_BY_OTHER_MESSAGE,
	buildModification,
	closePlanWrites,
} from '@/app/api/treatment-plans/treatment-plan.builder';
import type { TreatmentPlanDocument } from '@/app/api/treatment-plans/treatment-plan.schema';
import type {
	AdministrationWrite,
	DocumentWrite,
	TreatmentStaff,
} from '@/app/api/treatment-plans/treatment-plan.types';
import { CLINIC_TIME_ZONE } from '@/constants/defaults';
import { FollowUpStatus, TreatmentStatus } from '@/constants/enum';
import createHttpError from 'http-errors';
import type {
	ControlDecisionInput,
	RegisterControlInput,
} from './follow-up-control.schema';
import type { ControlSnapshot, ControlWrites } from './follow-up-control.types';
import type { FollowUp } from './follow-up.schema';

export const CONTROL_ALREADY_REGISTERED_MESSAGE =
	'Este control ya fue registrado';

type PlanWrite = DocumentWrite<TreatmentPlanDocument>;

export type ControlContext = {
	followUpId: string;
	staff: TreatmentStaff;
	now: string;
	medicationNames: ReadonlyMap<string, string>;
};

type DecisionOutcome = {
	plan: PlanWrite;
	cancelled: AdministrationWrite[];
	created: AdministrationWrite[];
	open: boolean;
};

const clinicDateFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: CLINIC_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

const isOpen = ({ status }: TreatmentPlanDocument): boolean =>
	status === TreatmentStatus.ACTIVE || status === TreatmentStatus.PLANNED;

const unprocessable = (message: string) =>
	new createHttpError.UnprocessableEntity(message);

function assertDecisionsMatchPlans(
	plans: PlanWrite[],
	decisions: ControlDecisionInput[]
): void {
	const planIds = new Set(plans.map(({ id }) => id));
	const decided = new Set<string>();
	for (const { planId } of decisions) {
		if (!planIds.has(planId))
			throw unprocessable(
				`La decisión no corresponde a un tratamiento del seguimiento: ${planId}`
			);
		if (decided.has(planId))
			throw unprocessable(`Decisión duplicada para el tratamiento: ${planId}`);
		decided.add(planId);
	}
	for (const plan of plans)
		if (isOpen(plan.data) && !decided.has(plan.id))
			throw unprocessable(
				`Falta la decisión del tratamiento activo: ${plan.id}`
			);
}

function assertReplaceable(plan: PlanWrite, replacedOrderIds: string[]): void {
	const active = new Set(
		plan.data.orders
			.filter((order) => order.status === TreatmentStatus.ACTIVE)
			.map(({ id }) => id)
	);
	const invalid = replacedOrderIds.find((id) => !active.has(id));
	if (invalid)
		throw unprocessable(
			`El medicamento a reemplazar no está activo: ${invalid}`
		);
}

function applyDecision(
	plan: PlanWrite,
	administrations: AdministrationWrite[],
	decision: ControlDecisionInput,
	ctx: ControlContext
): DecisionOutcome {
	if (
		decision.expectedUpdatedAt &&
		decision.expectedUpdatedAt !== plan.data.updatedAt
	)
		throw new createHttpError.Conflict(MODIFIED_BY_OTHER_MESSAGE);
	if (!isOpen(plan.data))
		throw new createHttpError.Conflict(ALREADY_CLOSED_MESSAGE);

	const { staff, now } = ctx;
	if (decision.decision === 'FINISH') {
		const result = closePlanWrites(
			plan,
			administrations,
			{
				action: 'COMPLETE',
				outcome: decision.outcome,
				reason: decision.outcomeNotes,
				expectedUpdatedAt: decision.expectedUpdatedAt,
			},
			{ staff, now }
		);
		return {
			plan: result.plan,
			cancelled: result.cancelled,
			created: [],
			open: false,
		};
	}
	if (decision.decision === 'MODIFY') {
		assertReplaceable(plan, decision.replacedOrderIds);
		const result = buildModification(
			plan,
			administrations,
			{
				replacedOrderIds: decision.replacedOrderIds,
				reason: decision.changeReason,
				medications: decision.medications,
			},
			{
				staff,
				now,
				petId: plan.data.petId,
				medicationNames: ctx.medicationNames,
			}
		);
		return {
			plan: result.plan,
			cancelled: result.cancelled,
			created: result.created,
			open: true,
		};
	}
	return { plan, cancelled: [], created: [], open: true };
}

function buildNextFollowUp(
	followUp: FollowUp,
	next: NonNullable<RegisterControlInput['nextFollowUp']>,
	ctx: ControlContext
): DocumentWrite<FollowUp> {
	if (next.recommendedDate <= clinicDateFormat.format(new Date(ctx.now)))
		throw unprocessable('La fecha del nuevo control debe ser futura');
	return {
		id: `${ctx.followUpId}-next`,
		data: {
			petId: followUp.petId,
			sourceEncounterId: followUp.sourceEncounterId,
			recommendedDate: next.recommendedDate,
			reason: next.reason,
			status: FollowUpStatus.PENDING,
			previousFollowUpId: ctx.followUpId,
			createdAt: ctx.now,
			createdBy: ctx.staff.id,
		},
	};
}

/**
 * Pure rules of a follow-up control: completes the follow-up, applies each
 * plan's decision and, if requested, opens the successor follow-up and moves
 * the plans that stay open to it.
 */
export function buildControlWrites(
	{
		followUp,
		nextFollowUpExists,
		plans,
		administrationsByPlan,
	}: ControlSnapshot,
	input: RegisterControlInput,
	ctx: ControlContext
): ControlWrites {
	if (followUp.status !== FollowUpStatus.PENDING)
		throw new createHttpError.Conflict(CONTROL_ALREADY_REGISTERED_MESSAGE);
	if (input.nextFollowUp && nextFollowUpExists)
		throw new createHttpError.Conflict(CONTROL_ALREADY_REGISTERED_MESSAGE);
	assertDecisionsMatchPlans(plans, input.decisions);

	const { followUpId, staff, now } = ctx;
	const nextFollowUp = input.nextFollowUp
		? buildNextFollowUp(followUp, input.nextFollowUp, ctx)
		: undefined;
	const planById = new Map(plans.map((plan) => [plan.id, plan]));
	const outcomes = input.decisions.map((decision) => {
		const plan = planById.get(decision.planId) as PlanWrite;
		return applyDecision(
			plan,
			administrationsByPlan.get(plan.id) ?? [],
			decision,
			ctx
		);
	});

	const changedPlans = outcomes.flatMap(({ plan, open }, index) => {
		const changed = plan !== planById.get(input.decisions[index].planId);
		if (open && nextFollowUp)
			return [
				{
					id: plan.id,
					data: {
						...plan.data,
						followUpId: nextFollowUp.id,
						...(changed ? {} : { updatedAt: now, updatedBy: staff.id }),
					},
				},
			];
		return changed ? [plan] : [];
	});
	const cancelled = outcomes.flatMap((outcome) => outcome.cancelled);
	const created = outcomes.flatMap((outcome) => outcome.created);

	return {
		control: {
			petId: followUp.petId,
			followUpId,
			treatmentPlanIds: plans.map(({ id }) => id),
			reason: input.reason,
			evolution: input.evolution,
			weightKg: input.weightKg,
			temperatureC: input.temperatureC,
			clinicalNotes: input.clinicalNotes,
			treatmentResponse: input.treatmentResponse,
			decisions: input.decisions.map(({ planId, decision }) => ({
				planId,
				decision,
			})),
			recommendedDate: followUp.recommendedDate,
			nextFollowUpId: nextFollowUp?.id,
			registeredAt: now,
			registeredBy: staff.id,
			registeredByName: staff.name,
			createdAt: now,
		},
		followUpUpdate: {
			status: FollowUpStatus.COMPLETED,
			completedAt: now,
			controlId: followUpId,
		},
		nextFollowUp,
		plans: changedPlans,
		cancelled,
		created,
		operationCount:
			2 +
			(nextFollowUp ? 1 : 0) +
			changedPlans.length +
			cancelled.length +
			created.length,
	};
}
