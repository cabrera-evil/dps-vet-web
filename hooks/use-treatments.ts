import {
	ApplicationStatus,
	FollowUpStatus,
	TreatmentOutcome,
	TreatmentStatus,
} from '@/constants/enum';
import { queryClient } from '@/constants/environment';
import {
	ALREADY_REGISTERED_MESSAGE,
	CONTROL_ALREADY_REGISTERED_MESSAGE,
} from '@/constants/treatment';
import { buildMockPlans } from '@/mocks/treatments.mock';
import type { ControlFormValues } from '@/schemas/treatment.schema';
import type {
	CloseTreatmentAction,
	CloseTreatmentInput,
	ControlRecord,
	CreateTreatmentsInput,
	MedicationApplication,
	MedicationOrder,
	RegisterApplicationInput,
	RegisterControlInput,
	SkipApplicationInput,
	TreatmentFollowUp,
	TreatmentPlan,
} from '@/types/treatment.type';
import { generateId } from '@/utils/id';
import { buildMedicationOrder, getEndDate } from '@/utils/treatment';
import { useMutation, useQuery } from '@tanstack/react-query';

const NOT_FOUND = 'No se encontró el tratamiento';

const CLOSED_STATUS: Record<CloseTreatmentAction, TreatmentStatus> = {
	COMPLETE: TreatmentStatus.COMPLETED,
	SUSPEND: TreatmentStatus.SUSPENDED,
	CANCEL: TreatmentStatus.CANCELLED,
};

const plansKey = (petId: string) => [`/pets/${petId}/treatment-plans`];

const readPlans = (petId: string): TreatmentPlan[] => {
	return (
		queryClient.getQueryData<TreatmentPlan[]>(plansKey(petId)) ??
		buildMockPlans(petId)
	);
};

const writePlans = (petId: string, plans: TreatmentPlan[]): TreatmentPlan[] => {
	queryClient.setQueryData<TreatmentPlan[]>(plansKey(petId), plans);
	return plans;
};

const mapPlan = (
	plans: TreatmentPlan[],
	treatmentId: string,
	update: (plan: TreatmentPlan) => TreatmentPlan
): TreatmentPlan[] => {
	if (!plans.some((plan) => plan.id === treatmentId))
		throw new Error(NOT_FOUND);
	return plans.map((plan) => (plan.id === treatmentId ? update(plan) : plan));
};

const mapApplication = (
	plans: TreatmentPlan[],
	target: Omit<SkipApplicationInput, 'reason' | 'petId'>,
	update: (application: MedicationApplication) => MedicationApplication
): TreatmentPlan[] =>
	mapPlan(plans, target.treatmentId, (plan) => {
		const order = plan.orders.find(({ id }) => id === target.orderId);
		const application = order?.applications.find(
			({ id }) => id === target.applicationId
		);
		if (!order || !application) throw new Error(NOT_FOUND);
		if (application.status !== ApplicationStatus.SCHEDULED)
			throw new Error(ALREADY_REGISTERED_MESSAGE);
		return {
			...plan,
			orders: plan.orders.map((item) =>
				item.id === order.id
					? {
							...item,
							applications: item.applications.map((current) =>
								current.id === application.id ? update(current) : current
							),
						}
					: item
			),
		};
	});

const isOpen = (status: TreatmentStatus) =>
	status === TreatmentStatus.ACTIVE || status === TreatmentStatus.PLANNED;

const cancelScheduled = (order: MedicationOrder): MedicationOrder => ({
	...order,
	applications: order.applications.map((application) =>
		application.status === ApplicationStatus.SCHEDULED
			? { ...application, status: ApplicationStatus.CANCELLED }
			: application
	),
});

const closePlan = (
	plan: TreatmentPlan,
	action: CloseTreatmentAction,
	outcome?: TreatmentOutcome,
	reason?: string
): TreatmentPlan => {
	if (!isOpen(plan.status)) throw new Error('Este tratamiento ya fue cerrado');
	const status = CLOSED_STATUS[action];
	const closedAt = new Date().toISOString();
	const closeOrder = (order: MedicationOrder): MedicationOrder =>
		!isOpen(order.status)
			? order
			: {
					...cancelScheduled(order),
					status,
					stopReason:
						action === 'COMPLETE' ? undefined : reason?.trim() || undefined,
					stoppedAt: closedAt,
				};
	return {
		...plan,
		status,
		orders: plan.orders.map(closeOrder),
		outcome: {
			result:
				outcome ??
				(action === 'SUSPEND'
					? TreatmentOutcome.SUSPENDED
					: TreatmentOutcome.OTHER),
			notes: reason?.trim() || undefined,
			closedAt,
		},
	};
};

const modifyPlan = (
	plan: TreatmentPlan,
	values: ControlFormValues,
	now: Date
): TreatmentPlan => {
	if (!isOpen(plan.status)) throw new Error('Este tratamiento ya fue cerrado');
	const newOrders = (values.treatments[0]?.medications ?? []).map(
		(medication) =>
			buildMedicationOrder(
				{ ...medication, firstDoseInConsultation: false },
				now
			)
	);
	const replacedBy = newOrders[0]?.id;
	const stopReason = values.stopReason.trim();
	const orders = plan.orders.map((order) =>
		values.replacedOrderIds.includes(order.id) &&
		order.status === TreatmentStatus.ACTIVE
			? {
					...cancelScheduled(order),
					status: TreatmentStatus.SUSPENDED,
					stopReason,
					stoppedAt: now.toISOString(),
					replacedByOrderId: replacedBy,
				}
			: order
	);
	const ends = newOrders.map((order) =>
		getEndDate(new Date(order.startsAt), order).getTime()
	);
	const endsAt = Math.max(
		...ends,
		...(plan.endsAt ? [new Date(plan.endsAt).getTime()] : [])
	);
	return {
		...plan,
		orders: [...orders, ...newOrders],
		endsAt: new Date(endsAt).toISOString(),
	};
};

// No invalidar esta clave mientras sea de ejemplo: se reconstruiría y revertiría las mutaciones.
export function useTreatmentPlans(petId: string, enabled = true) {
	return useQuery<TreatmentPlan[], Error>({
		queryKey: plansKey(petId),
		queryFn: () => Promise.resolve(buildMockPlans(petId)), // [] salvo para el paciente de ejemplo
		staleTime: Infinity,
		gcTime: Infinity,
		enabled,
	});
}

export function useTreatmentPlan(petId: string, id: string, enabled = true) {
	return useQuery<TreatmentPlan[], Error, TreatmentPlan | undefined>({
		queryKey: plansKey(petId),
		queryFn: () => Promise.resolve(buildMockPlans(petId)),
		staleTime: Infinity,
		gcTime: Infinity,
		enabled,
		select: (plans) => plans.find((plan) => plan.id === id),
	});
}

export function useRegisterApplication() {
	return useMutation<TreatmentPlan[], Error, RegisterApplicationInput>({
		mutationFn: ({ petId, values, administeredByName, ...target }) =>
			Promise.resolve(
				writePlans(
					petId,
					mapApplication(readPlans(petId), target, (application) => ({
						...application,
						status: ApplicationStatus.COMPLETED,
						administeredAt: new Date(
							`${values.date}T${values.time}`
						).toISOString(),
						administeredByName,
						actualDose: Number(values.dose),
						actualDoseUnit: values.doseUnit,
						actualRoute: values.route,
						adjustmentReason: values.adjustmentReason.trim() || undefined,
						site: values.site.trim() || undefined,
						notes: values.notes.trim() || undefined,
						adverseReaction:
							values.hasAdverseReaction && values.reactionSeverity
								? {
										description: values.reactionDescription.trim(),
										severity: values.reactionSeverity,
										action: values.reactionAction.trim() || undefined,
									}
								: undefined,
					}))
				)
			),
	});
}

export function useSkipApplication() {
	return useMutation<TreatmentPlan[], Error, SkipApplicationInput>({
		mutationFn: ({ petId, reason, ...target }) =>
			Promise.resolve(
				writePlans(
					petId,
					mapApplication(readPlans(petId), target, (application) => ({
						...application,
						status: ApplicationStatus.SKIPPED,
						skipReason: reason.trim(),
					}))
				)
			),
	});
}

export function useCloseTreatment() {
	return useMutation<TreatmentPlan[], Error, CloseTreatmentInput>({
		mutationFn: ({ petId, treatmentId, action, outcome, reason }) =>
			Promise.resolve(
				writePlans(
					petId,
					mapPlan(readPlans(petId), treatmentId, (plan) =>
						closePlan(plan, action, outcome, reason)
					)
				)
			),
	});
}

export function useCreateTreatmentsFromConsultation() {
	return useMutation<TreatmentPlan[], Error, CreateTreatmentsInput>({
		mutationFn: ({
			petId,
			consultationId,
			consultationLabel,
			consultationAt,
			treatments,
			followUp,
		}) => {
			const created = treatments.map((treatment): TreatmentPlan => {
				const orders = treatment.medications.map((medication) =>
					buildMedicationOrder(medication, consultationAt)
				);
				const starts = orders.map(({ startsAt }) => new Date(startsAt));
				const startsAt = new Date(Math.min(...starts.map(Number)));
				return {
					id: generateId(),
					petId,
					sourceConsultationId: consultationId,
					sourceConsultationLabel: consultationLabel,
					diagnosis: treatment.diagnosis.trim(),
					status: TreatmentStatus.ACTIVE,
					startsAt: startsAt.toISOString(),
					endsAt: new Date(
						Math.max(
							...orders.map((order, index) =>
								getEndDate(starts[index], order).getTime()
							)
						)
					).toISOString(),
					ownerInstructions: treatment.ownerInstructions.trim() || undefined,
					internalNotes: treatment.internalNotes.trim() || undefined,
					orders,
					followUp: followUp && {
						id: generateId(),
						recommendedDate: new Date(
							`${followUp.recommendedDate}T00:00`
						).toISOString(),
						reason: followUp.reason.trim(),
						status: FollowUpStatus.PENDING,
					},
				};
			});
			const current =
				queryClient.getQueryData<TreatmentPlan[]>(plansKey(petId)) ??
				buildMockPlans(petId);
			return Promise.resolve(writePlans(petId, [...created, ...current]));
		},
	});
}

export function useRegisterControl() {
	return useMutation<TreatmentPlan[], Error, RegisterControlInput>({
		mutationFn: ({ petId, followUpId, values }) => {
			const plans = readPlans(petId);
			const plan = plans.find((item) => item.followUp?.id === followUpId);
			const wasRegistered = plans.some((item) =>
				item.controls?.some((control) => control.followUpId === followUpId)
			);
			if (wasRegistered) throw new Error(CONTROL_ALREADY_REGISTERED_MESSAGE);
			// Sin plan asociado no hay dónde guardar el control hasta integrar la API.
			if (!plan?.followUp) return Promise.resolve(plans);
			if (plan.followUp.status !== FollowUpStatus.PENDING)
				throw new Error(CONTROL_ALREADY_REGISTERED_MESSAGE);
			const now = new Date();
			const hasOpenPlan = isOpen(plan.status);
			let updated: TreatmentPlan = plan;
			if (hasOpenPlan && values.decision === 'MODIFY')
				updated = modifyPlan(plan, values, now);
			if (hasOpenPlan && values.decision === 'FINISH')
				updated = closePlan(
					plan,
					'COMPLETE',
					values.outcome || undefined,
					values.outcomeNotes
				);
			const toNumber = (value: string) =>
				value.trim() ? Number(value) : undefined;
			const control: ControlRecord = {
				id: generateId(),
				followUpId,
				recommendedDate: plan.followUp.recommendedDate,
				registeredAt: now.toISOString(),
				reason: values.reason.trim(),
				evolution: values.evolution,
				weightKg: toNumber(values.weightKg),
				temperatureC: toNumber(values.temperatureC),
				clinicalNotes: values.observations.trim() || undefined,
				treatmentResponse: values.treatmentResponse.trim() || undefined,
				decision: hasOpenPlan ? values.decision : undefined,
			};
			const followUp: TreatmentFollowUp = values.requiresFollowUp
				? {
						id: generateId(),
						recommendedDate: new Date(
							`${values.followUpDate}T00:00`
						).toISOString(),
						reason: values.followUpReason.trim(),
						status: FollowUpStatus.PENDING,
					}
				: { ...plan.followUp, status: FollowUpStatus.COMPLETED };
			return Promise.resolve(
				writePlans(
					petId,
					mapPlan(plans, plan.id, () => ({
						...updated,
						followUp,
						controls: [...(plan.controls ?? []), control],
					}))
				)
			);
		},
	});
}
