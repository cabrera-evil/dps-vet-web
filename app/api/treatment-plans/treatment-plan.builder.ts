import {
	AdministrationContext,
	ApplicationStatus,
	TreatmentOutcome,
	TreatmentStatus,
} from '@/constants/enum';
import {
	buildSchedule,
	countClinicApplications,
	getEndDate,
} from '@/utils/treatment';
import createHttpError from 'http-errors';
import type {
	CloseTreatmentInput,
	CreateTreatmentInput,
	MedicationAdministrationDocument,
	MedicationOrderDocument,
	TreatmentMedicationInput,
	TreatmentPlanDocument,
} from './treatment-plan.schema';
import type {
	AdministrationWrite,
	DocumentWrite,
	TreatmentModification,
	TreatmentStaff,
} from './treatment-plan.types';

export const MAX_NEW_APPLICATIONS = 400;

const CLOSED_STATUS: Record<CloseTreatmentInput['action'], TreatmentStatus> = {
	COMPLETE: TreatmentStatus.COMPLETED,
	SUSPEND: TreatmentStatus.SUSPENDED,
	CANCEL: TreatmentStatus.CANCELLED,
};

export const ALREADY_CLOSED_MESSAGE = 'Este tratamiento ya fue cerrado';
export const MODIFIED_BY_OTHER_MESSAGE =
	'Este tratamiento fue modificado por otra persona';

type PlanWrite = DocumentWrite<TreatmentPlanDocument>;
type MedicationNames = ReadonlyMap<string, string>;

type ActorContext = {
	staff: TreatmentStaff;
	now: string;
	createdBy?: string;
};

type OrderContext = ActorContext & {
	petId: string;
	medicationNames: MedicationNames;
};

export type PlanWritesContext = OrderContext & {
	createdBy: string;
	encounterId: string;
	sourceConsultationLabel: string;
	occurredAt: string;
	followUpId?: string;
};

export type PlanWritesResult = {
	plans: PlanWrite[];
	administrations: AdministrationWrite[];
	operationCount: number;
};

export type CloseWritesResult = {
	plan: PlanWrite;
	cancelled: AdministrationWrite[];
	operationCount: number;
};

export type ModificationResult = CloseWritesResult & {
	created: AdministrationWrite[];
};

const isOpen = (status: TreatmentStatus): boolean =>
	status === TreatmentStatus.ACTIVE || status === TreatmentStatus.PLANNED;

const auditFor = ({ staff, now, createdBy }: ActorContext) => ({
	createdAt: now,
	createdBy: createdBy ?? staff.id,
	updatedAt: now,
	updatedBy: createdBy ?? staff.id,
});

function assertWithinCap(medications: TreatmentMedicationInput[]): void {
	const total = medications.reduce(
		(sum, medication) => sum + countClinicApplications(medication),
		0
	);
	if (total > MAX_NEW_APPLICATIONS)
		throw new createHttpError.UnprocessableEntity(
			`El tratamiento generaría ${total} aplicaciones; el máximo permitido es ${MAX_NEW_APPLICATIONS}`
		);
}

function resolveName(names: MedicationNames, medicationId: string): string {
	const name = names.get(medicationId);
	if (!name)
		throw new createHttpError.UnprocessableEntity(
			`Medicamento no disponible: ${medicationId}`
		);
	return name;
}

type OrderBuild = {
	order: MedicationOrderDocument;
	administrations: AdministrationWrite[];
	endsAt: Date;
};

function buildOrder(
	planId: string,
	orderIndex: number,
	medication: TreatmentMedicationInput,
	ctx: OrderContext,
	firstDoseAt?: string
): OrderBuild {
	const orderId = `${planId}_${orderIndex}`;
	const startsAt = new Date(medication.startsAt);
	const isClinic = medication.context === AdministrationContext.CLINIC;
	const schedule = buildSchedule(startsAt, medication);
	const firstDone =
		isClinic && !!medication.firstDoseInConsultation && schedule.length > 0;
	const audit = auditFor(ctx);

	return {
		order: {
			...medication,
			id: orderId,
			medicationName: resolveName(ctx.medicationNames, medication.medicationId),
			startsAt: startsAt.toISOString(),
			firstDoseInConsultation: firstDone && firstDoseAt ? true : undefined,
			status: TreatmentStatus.ACTIVE,
		},
		administrations: schedule.map((date, index) => {
			const done = index === 0 && firstDone && !!firstDoseAt;
			const data: MedicationAdministrationDocument = {
				petId: ctx.petId,
				treatmentPlanId: planId,
				orderId,
				sequence: index + 1,
				total: schedule.length,
				scheduledAt: date.toISOString(),
				status: done
					? ApplicationStatus.COMPLETED
					: ApplicationStatus.SCHEDULED,
				administeredAt: done ? firstDoseAt : undefined,
				administeredBy: done ? ctx.staff.id : undefined,
				administeredByName: done ? ctx.staff.name : undefined,
				...audit,
			};
			return { id: `${orderId}_${index + 1}`, data };
		}),
		endsAt: getEndDate(startsAt, medication),
	};
}

const earliest = (dates: string[]): string =>
	dates.reduce((min, date) => (date < min ? date : min));

const latest = (dates: Date[]): Date =>
	new Date(Math.max(...dates.map((date) => date.getTime())));

/** Plans, embedded orders and scheduled applications for a finalized consultation. */
export function buildPlanWrites(
	input: CreateTreatmentInput,
	ctx: PlanWritesContext
): PlanWritesResult {
	if (!input.length || input.some((plan) => !plan.medications.length))
		throw new createHttpError.UnprocessableEntity(
			'Cada tratamiento necesita al menos un medicamento'
		);
	assertWithinCap(input.flatMap((plan) => plan.medications));
	const audit = auditFor(ctx);

	const built = input.map((plan, planIndex) => {
		const id = `${ctx.encounterId}_${planIndex}`;
		const orders = plan.medications.map((medication, orderIndex) =>
			buildOrder(id, orderIndex, medication, ctx, ctx.occurredAt)
		);
		const data: TreatmentPlanDocument = {
			petId: ctx.petId,
			sourceEncounterId: ctx.encounterId,
			sourceConsultationLabel: ctx.sourceConsultationLabel,
			followUpId: ctx.followUpId,
			diagnosis: plan.diagnosis,
			status: TreatmentStatus.ACTIVE,
			startsAt: earliest(orders.map(({ order }) => order.startsAt)),
			endsAt: latest(orders.map(({ endsAt }) => endsAt)).toISOString(),
			ownerInstructions: plan.ownerInstructions || undefined,
			internalNotes: plan.internalNotes || undefined,
			orders: orders.map(({ order }) => order),
			...audit,
		};
		return {
			plan: { id, data },
			administrations: orders.flatMap((order) => order.administrations),
		};
	});

	const administrations = built.flatMap((item) => item.administrations);
	return {
		plans: built.map((item) => item.plan),
		administrations,
		operationCount: built.length + administrations.length,
	};
}

function assertOpen(plan: TreatmentPlanDocument): void {
	if (!isOpen(plan.status))
		throw new createHttpError.Conflict(ALREADY_CLOSED_MESSAGE);
}

const cancelScheduled = (
	administrations: AdministrationWrite[],
	orderIds: ReadonlySet<string>,
	ctx: ActorContext
): AdministrationWrite[] =>
	administrations
		.filter(
			({ data }) =>
				orderIds.has(data.orderId) &&
				data.status === ApplicationStatus.SCHEDULED
		)
		.map(({ id, data }) => ({
			id,
			data: {
				...data,
				status: ApplicationStatus.CANCELLED,
				updatedAt: ctx.now,
				updatedBy: ctx.staff.id,
			},
		}));

/** Closes an open plan: open orders take the final status and pending applications are cancelled. */
export function closePlanWrites(
	plan: PlanWrite,
	administrations: AdministrationWrite[],
	input: CloseTreatmentInput,
	ctx: ActorContext
): CloseWritesResult {
	assertOpen(plan.data);
	if (
		input.expectedUpdatedAt &&
		input.expectedUpdatedAt !== plan.data.updatedAt
	)
		throw new createHttpError.Conflict(MODIFIED_BY_OTHER_MESSAGE);

	const status = CLOSED_STATUS[input.action];
	const reason = input.reason?.trim() || undefined;
	const openOrderIds = new Set(
		plan.data.orders.filter((order) => isOpen(order.status)).map(({ id }) => id)
	);
	const cancelled = cancelScheduled(administrations, openOrderIds, ctx);

	return {
		plan: {
			id: plan.id,
			data: {
				...plan.data,
				status,
				orders: plan.data.orders.map((order) =>
					openOrderIds.has(order.id)
						? {
								...order,
								status,
								stopReason: input.action === 'COMPLETE' ? undefined : reason,
								stoppedAt: ctx.now,
							}
						: order
				),
				outcome: {
					result:
						input.outcome ??
						(input.action === 'SUSPEND'
							? TreatmentOutcome.SUSPENDED
							: TreatmentOutcome.OTHER),
					notes: reason,
					closedAt: ctx.now,
				},
				updatedAt: ctx.now,
				updatedBy: ctx.staff.id,
			},
		},
		cancelled,
		operationCount: 1 + cancelled.length,
	};
}

/** Suspends the replaced orders (keeping them) and appends the new ones with their applications. */
export function buildModification(
	plan: PlanWrite,
	administrations: AdministrationWrite[],
	decision: TreatmentModification,
	ctx: OrderContext
): ModificationResult {
	assertOpen(plan.data);
	assertWithinCap(decision.medications);

	const firstIndex = plan.data.orders.length;
	const built = decision.medications.map((medication, index) =>
		buildOrder(plan.id, firstIndex + index, medication, ctx)
	);
	const replacedBy = built[0]?.order.id;
	const replacedIds = new Set(
		plan.data.orders
			.filter(
				(order) =>
					decision.replacedOrderIds.includes(order.id) &&
					order.status === TreatmentStatus.ACTIVE
			)
			.map(({ id }) => id)
	);
	const cancelled = cancelScheduled(administrations, replacedIds, ctx);
	const created = built.flatMap((item) => item.administrations);
	const orders = [
		...plan.data.orders.map((order) =>
			replacedIds.has(order.id)
				? {
						...order,
						status: TreatmentStatus.SUSPENDED,
						stopReason: decision.reason.trim(),
						stoppedAt: ctx.now,
						replacedByOrderId: replacedBy,
					}
				: order
		),
		...built.map(({ order }) => order),
	];
	const activeEnds = orders
		.filter((order) => order.status === TreatmentStatus.ACTIVE)
		.map((order) => getEndDate(new Date(order.startsAt), order));
	const endDates = activeEnds.length
		? activeEnds
		: orders.map((order) => getEndDate(new Date(order.startsAt), order));
	return {
		plan: {
			id: plan.id,
			data: {
				...plan.data,
				orders,
				endsAt: latest(endDates).toISOString(),
				updatedAt: ctx.now,
				updatedBy: ctx.staff.id,
			},
		},
		cancelled,
		created,
		operationCount: 1 + cancelled.length + created.length,
	};
}
