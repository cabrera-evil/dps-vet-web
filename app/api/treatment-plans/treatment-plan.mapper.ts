import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { FollowUpControl } from '@/app/api/consultations/follow-up-control.schema';
import type {
	ControlRecord,
	MedicationApplication,
	TreatmentFollowUp,
	TreatmentPlan,
} from '@/types/treatment.type';
import type { TreatmentPlanDocument } from './treatment-plan.schema';
import type {
	AdministrationWrite,
	DocumentWrite,
} from './treatment-plan.types';

type PlanExtras = {
	followUp?: TreatmentFollowUp;
	controls?: ControlRecord[];
};

/** Without a plan id the record carries no decision (it spans several plans). */
export const toControlRecord = (
	control: WithId<FollowUpControl>,
	planId?: string
): ControlRecord => ({
	id: control.id,
	followUpId: control.followUpId,
	recommendedDate: control.recommendedDate,
	registeredAt: control.registeredAt,
	reason: control.reason,
	evolution: control.evolution,
	weightKg: control.weightKg,
	temperatureC: control.temperatureC,
	clinicalNotes: control.clinicalNotes,
	treatmentResponse: control.treatmentResponse,
	decision: control.decisions.find((item) => item.planId === planId)?.decision,
});

const toApplication = ({
	id,
	data,
}: AdministrationWrite): MedicationApplication => ({
	id,
	sequence: data.sequence,
	total: data.total,
	scheduledAt: data.scheduledAt,
	status: data.status,
	administeredAt: data.administeredAt,
	administeredByName: data.administeredByName,
	actualDose: data.actualDose,
	actualDoseUnit: data.actualDoseUnit,
	actualRoute: data.actualRoute,
	adjustmentReason: data.adjustmentReason,
	site: data.site,
	notes: data.notes,
	skipReason: data.skipReason,
	adverseReaction: data.adverseReaction,
});

const groupByOrder = (
	administrations: AdministrationWrite[]
): Map<string, AdministrationWrite[]> => {
	const groups = new Map<string, AdministrationWrite[]>();
	for (const administration of administrations) {
		const group = groups.get(administration.data.orderId) ?? [];
		group.push(administration);
		groups.set(administration.data.orderId, group);
	}
	return groups;
};

const bySequence = (a: AdministrationWrite, b: AdministrationWrite): number =>
	a.data.sequence - b.data.sequence;

/** Assembles the plan the UI consumes from its stored document and applications. */
export function toTreatmentPlan(
	{ id, data }: DocumentWrite<TreatmentPlanDocument>,
	administrations: AdministrationWrite[],
	extras: PlanExtras = {}
): TreatmentPlan {
	const groups = groupByOrder(administrations);
	return {
		id,
		petId: data.petId,
		sourceConsultationId: data.sourceEncounterId,
		sourceConsultationLabel: data.sourceConsultationLabel,
		diagnosis: data.diagnosis,
		status: data.status,
		startsAt: data.startsAt,
		endsAt: data.endsAt,
		updatedAt: data.updatedAt,
		ownerInstructions: data.ownerInstructions,
		internalNotes: data.internalNotes,
		followUp: extras.followUp,
		controls: extras.controls,
		outcome: data.outcome,
		orders: data.orders.map((order) => ({
			...order,
			applications: (groups.get(order.id) ?? [])
				.sort(bySequence)
				.map(toApplication),
		})),
	};
}
