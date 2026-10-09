import {
	AdministrationContext,
	ApplicationStatus,
	DurationUnit,
	TreatmentStatus,
	type AdministrationRoute,
} from '@/constants/enum';
import {
	CUSTOM_FREQUENCY,
	INJECTABLE_ROUTES,
	PRN_FREQUENCY,
} from '@/constants/treatment';
import type { MedicationOrderFormValues } from '@/schemas/treatment.schema';
import type {
	MedicationApplication,
	MedicationOrder,
	PendingApplication,
	TreatmentPlan,
} from '@/types/treatment.type';
import { generateId } from '@/utils/id';
import { addDays, addHours, endOfDay, isBefore, parseISO } from 'date-fns';

type Schedulable = Pick<
	MedicationOrder,
	'frequencyHours' | 'durationValue' | 'durationUnit' | 'context'
>;

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;

const toDays = (order: Schedulable): number =>
	order.durationUnit === DurationUnit.WEEKS
		? order.durationValue * DAYS_PER_WEEK
		: order.durationValue;

/** Total de dosis de la pauta; 0 si no es determinística (PRN). */
export function countApplications(order: Schedulable): number {
	if (!order.frequencyHours) return 0;
	if (order.durationUnit === DurationUnit.APPLICATIONS)
		return order.durationValue;
	return Math.floor((toDays(order) * HOURS_PER_DAY) / order.frequencyHours);
}

/** Dosis que registra la clínica: todas si el medicamento es «En clínica», ninguna si es «En casa». */
export function countClinicApplications(order: Schedulable): number {
	return order.context === AdministrationContext.CLINIC
		? countApplications(order)
		: 0;
}

/** Las inyecciones solo se aplican en la clínica. */
export function isInjectable(route: AdministrationRoute): boolean {
	return INJECTABLE_ROUTES.includes(route);
}

/** Suma horas conservando la hora local cuando el intervalo es de días completos (cambio de horario). */
export const addInterval = (date: Date, hours: number): Date =>
	hours % HOURS_PER_DAY === 0
		? addDays(date, hours / HOURS_PER_DAY)
		: addHours(date, hours);

export function buildSchedule(startsAt: Date, order: Schedulable): Date[] {
	const interval = order.frequencyHours;
	if (!interval) return [];
	return Array.from({ length: countClinicApplications(order) }, (_, index) =>
		addInterval(startsAt, index * interval)
	);
}

export function getEndDate(startsAt: Date, order: Schedulable): Date {
	const total = countApplications(order);
	if (total && order.frequencyHours)
		return addInterval(startsAt, total * order.frequencyHours);
	return addDays(startsAt, toDays(order));
}

export function getProgress(order: Pick<MedicationOrder, 'applications'>): {
	done: number;
	total: number;
} {
	const counted = order.applications.filter(
		(application) => application.status !== ApplicationStatus.CANCELLED
	);
	return {
		done: counted.filter(
			(application) => application.status === ApplicationStatus.COMPLETED
		).length,
		total: counted.length,
	};
}

export function getNextApplication(
	order: Pick<MedicationOrder, 'applications' | 'status'>
): MedicationApplication | undefined {
	if (order.status !== TreatmentStatus.ACTIVE) return undefined;
	return order.applications
		.filter((application) => application.status === ApplicationStatus.SCHEDULED)
		.sort(
			(a, b) =>
				parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
		)[0];
}

export function isOverdue(
	application: Pick<MedicationApplication, 'status' | 'scheduledAt'>,
	now: Date
): boolean {
	return (
		application.status === ApplicationStatus.SCHEDULED &&
		isBefore(parseISO(application.scheduledAt), now)
	);
}

/** Aplicaciones programadas de planes activos hasta el fin de hoy, incluidas las vencidas. */
export function getPendingToday(
	plans: TreatmentPlan[],
	now: Date
): PendingApplication[] {
	const limit = endOfDay(now);
	return plans
		.filter((plan) => plan.status === TreatmentStatus.ACTIVE)
		.flatMap((plan) =>
			plan.orders
				.filter((order) => order.status === TreatmentStatus.ACTIVE)
				.flatMap((order) =>
					order.applications
						.filter(
							(application) =>
								application.status === ApplicationStatus.SCHEDULED &&
								!isBefore(limit, parseISO(application.scheduledAt))
						)
						.map((application) => ({ plan, order, application }))
				)
		)
		.sort(
			(a, b) =>
				parseISO(a.application.scheduledAt).getTime() -
				parseISO(b.application.scheduledAt).getTime()
		);
}

/** Horas entre dosis del formulario; undefined si es «Según necesidad». */
export function resolveFrequencyHours(
	values: Pick<MedicationOrderFormValues, 'frequency' | 'customFrequencyHours'>
): number | undefined {
	if (values.frequency === PRN_FREQUENCY) return undefined;
	const hours = Number(
		values.frequency === CUSTOM_FREQUENCY
			? values.customFrequencyHours
			: values.frequency
	);
	return hours > 0 ? hours : undefined;
}

/** Aplicaciones programadas de una pauta; con `firstDoseAt` la primera nace completada. */
export function buildApplications(
	startsAt: Date,
	order: Schedulable,
	firstDoseAt?: Date
): MedicationApplication[] {
	const schedule = buildSchedule(startsAt, order);
	return schedule.map((date, index) => {
		const done = index === 0 && !!firstDoseAt;
		return {
			id: generateId(),
			sequence: index + 1,
			total: schedule.length,
			scheduledAt: date.toISOString(),
			status: done ? ApplicationStatus.COMPLETED : ApplicationStatus.SCHEDULED,
			administeredAt: done ? firstDoseAt.toISOString() : undefined,
		};
	});
}

/** Convierte el medicamento del formulario en una orden con su programación. */
export function buildMedicationOrder(
	values: MedicationOrderFormValues,
	consultationAt: Date
): MedicationOrder {
	const startsAt = new Date(`${values.startDate}T${values.startTime}`);
	const schedulable: Schedulable = {
		frequencyHours: resolveFrequencyHours(values),
		durationValue: Number(values.durationValue),
		durationUnit: values.durationUnit,
		context: values.context,
	};
	const firstDoseAt =
		values.context === AdministrationContext.CLINIC &&
		values.firstDoseInConsultation
			? consultationAt
			: undefined;
	return {
		id: generateId(),
		medicationId: values.medicationId,
		medicationName: values.medicationName,
		dose: Number(values.dose),
		doseUnit: values.doseUnit,
		route: values.route,
		...schedulable,
		startsAt: startsAt.toISOString(),
		firstDoseInConsultation:
			values.context === AdministrationContext.CLINIC &&
			values.firstDoseInConsultation
				? true
				: undefined,
		instructions: values.instructions,
		status: TreatmentStatus.ACTIVE,
		applications: buildApplications(startsAt, schedulable, firstDoseAt),
	};
}
