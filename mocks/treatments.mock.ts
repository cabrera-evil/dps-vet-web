import {
	AdministrationContext,
	AdministrationRoute,
	ApplicationStatus,
	DoseUnit,
	DurationUnit,
	FollowUpStatus,
	TreatmentOutcome,
	TreatmentStatus,
} from '@/constants/enum';
import { TREATMENTS_MOCK_PET_ID } from '@/constants/treatment';
import type { MedicationOrder, TreatmentPlan } from '@/types/treatment.type';
import { buildApplications, getEndDate } from '@/utils/treatment';
import { addDays, setHours, startOfDay, subDays } from 'date-fns';

const CLINIC_HOUR = 10;
const FOLLOW_UP_AFTER_DAYS = 7;
const COMPLETED_CLINIC_APPLICATIONS = 2;
const HISTORY_AGE_DAYS = 30;

const latestEnd = (startsAt: Date, orders: MedicationOrder[]): Date =>
	new Date(
		Math.max(...orders.map((order) => getEndDate(startsAt, order).getTime()))
	);

function buildActivePlan(petId: string, now: Date): TreatmentPlan {
	const startsAt = setHours(
		subDays(startOfDay(now), COMPLETED_CLINIC_APPLICATIONS),
		CLINIC_HOUR
	);

	const ceftriaxone: MedicationOrder = {
		id: `${petId}-order-ceftriaxone`,
		medicationId: `${petId}-medication-ceftriaxone`,
		medicationName: 'Ceftriaxona',
		dose: 500,
		doseUnit: DoseUnit.MG,
		route: AdministrationRoute.IM,
		frequencyHours: 24,
		durationValue: 5,
		durationUnit: DurationUnit.DAYS,
		startsAt: startsAt.toISOString(),
		context: AdministrationContext.CLINIC,
		firstDoseInConsultation: true,
		instructions:
			'Traer a la mascota a la clínica cada día para la aplicación.',
		status: TreatmentStatus.ACTIVE,
		applications: [],
	};
	ceftriaxone.applications = buildApplications(startsAt, ceftriaxone).map(
		(application) =>
			application.sequence <= COMPLETED_CLINIC_APPLICATIONS
				? {
						...application,
						status: ApplicationStatus.COMPLETED,
						administeredAt: application.scheduledAt,
						actualDose: ceftriaxone.dose,
					}
				: application
	);

	const omeprazole: MedicationOrder = {
		id: `${petId}-order-omeprazole`,
		medicationId: `${petId}-medication-omeprazole`,
		medicationName: 'Omeprazol',
		dose: 10,
		doseUnit: DoseUnit.MG,
		route: AdministrationRoute.ORAL,
		frequencyHours: 12,
		durationValue: 5,
		durationUnit: DurationUnit.DAYS,
		startsAt: startsAt.toISOString(),
		context: AdministrationContext.HOME,
		instructions: 'Dar en ayunas, antes de la comida.',
		status: TreatmentStatus.ACTIVE,
		applications: [],
	};

	const orders = [ceftriaxone, omeprazole];
	return {
		id: `${petId}-plan-active`,
		petId,
		sourceConsultationId: '',
		sourceConsultationLabel: 'Consulta digestiva',
		diagnosis: 'Gastroenteritis',
		status: TreatmentStatus.ACTIVE,
		startsAt: startsAt.toISOString(),
		endsAt: latestEnd(startsAt, orders).toISOString(),
		ownerInstructions:
			'Dieta blanda durante el tratamiento y agua fresca disponible.',
		internalNotes: 'Vigilar hidratación en el próximo control.',
		followUp: {
			id: `${petId}-follow-up-active`,
			recommendedDate: addDays(startsAt, FOLLOW_UP_AFTER_DAYS).toISOString(),
			reason: 'Control de la evolución de la gastroenteritis',
			status: FollowUpStatus.PENDING,
		},
		orders,
	};
}

function buildHistoryPlan(petId: string, now: Date): TreatmentPlan {
	const startsAt = setHours(
		subDays(startOfDay(now), HISTORY_AGE_DAYS),
		CLINIC_HOUR
	);
	const amoxicillin: MedicationOrder = {
		id: `${petId}-order-amoxicillin`,
		medicationId: `${petId}-medication-amoxicillin`,
		medicationName: 'Amoxicilina',
		dose: 250,
		doseUnit: DoseUnit.MG,
		route: AdministrationRoute.ORAL,
		frequencyHours: 12,
		durationValue: 7,
		durationUnit: DurationUnit.DAYS,
		startsAt: startsAt.toISOString(),
		context: AdministrationContext.HOME,
		instructions: 'Dar con alimento cada 12 horas hasta terminar.',
		status: TreatmentStatus.COMPLETED,
		applications: [],
	};
	const endsAt = getEndDate(startsAt, amoxicillin);
	return {
		id: `${petId}-plan-history`,
		petId,
		sourceConsultationId: '',
		sourceConsultationLabel: 'Consulta general',
		diagnosis: 'Otitis externa',
		status: TreatmentStatus.COMPLETED,
		startsAt: startsAt.toISOString(),
		endsAt: endsAt.toISOString(),
		outcome: {
			result: TreatmentOutcome.COMPLETED,
			closedAt: endsAt.toISOString(),
		},
		orders: [amoxicillin],
	};
}

/** Planes de ejemplo; vacío salvo para el paciente de ejemplo. */
export function buildMockPlans(
	petId: string,
	now: Date = new Date()
): TreatmentPlan[] {
	if (!TREATMENTS_MOCK_PET_ID || petId !== TREATMENTS_MOCK_PET_ID) return [];
	return [buildActivePlan(petId, now), buildHistoryPlan(petId, now)];
}
