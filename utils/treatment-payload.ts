import type { DraftTreatment } from '@/app/api/consultations/consultation.schema';
import {
	AdministrationContext,
	type AdministrationRoute,
	type AdverseReactionSeverity,
	type DoseUnit,
	type FollowUpEvolution,
	type TreatmentOutcome,
} from '@/constants/enum';
import {
	CUSTOM_FREQUENCY,
	FREQUENCY_OPTIONS,
	NEW_MEDICATION,
} from '@/constants/treatment';
import type {
	ApplicationFormValues,
	ControlFormValues,
	MedicationOrderFormValues,
	TreatmentFormValues,
} from '@/schemas/treatment.schema';
import { resolveFrequencyHours } from '@/utils/treatment';
import { format } from 'date-fns';

export type TreatmentMedicationPayload = DraftTreatment['medications'][number];

const toOptionalText = (value: string) => value.trim() || undefined;

const toOptionalNumber = (value: string) => {
	if (!value.trim()) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
};

/** Local date and time → ISO instant in the browser's time zone. */
const toIsoInstant = (date: string, time: string) => {
	if (!date || !time) return undefined;
	const instant = new Date(`${date}T${time}`);
	return Number.isNaN(instant.getTime()) ? undefined : instant.toISOString();
};

const FIXED_FREQUENCIES = FREQUENCY_OPTIONS.map(({ value }) => value);

export function toMedicationPayload(
	values: MedicationOrderFormValues
): TreatmentMedicationPayload {
	const frequencyHours = resolveFrequencyHours(values);
	const keepsFirstDose =
		values.context === AdministrationContext.CLINIC &&
		frequencyHours !== undefined &&
		values.firstDoseInConsultation;
	return {
		medicationId: toOptionalText(values.medicationId),
		dose: toOptionalNumber(values.dose),
		doseUnit: values.doseUnit || undefined,
		route: values.route || undefined,
		frequencyHours,
		durationValue: toOptionalNumber(values.durationValue),
		durationUnit: values.durationUnit || undefined,
		startsAt: toIsoInstant(values.startDate, values.startTime),
		context: values.context || undefined,
		firstDoseInConsultation: keepsFirstDose ? true : undefined,
		instructions: toOptionalText(values.instructions),
	};
}

export function toTreatmentPayload(
	treatments: TreatmentFormValues[]
): DraftTreatment[] {
	return treatments.map((treatment) => ({
		diagnosis: toOptionalText(treatment.diagnosis),
		ownerInstructions: toOptionalText(treatment.ownerInstructions),
		internalNotes: toOptionalText(treatment.internalNotes),
		medications: treatment.medications.map(toMedicationPayload),
	}));
}

function toFrequencyFormValues(
	frequencyHours?: number
): Pick<MedicationOrderFormValues, 'frequency' | 'customFrequencyHours'> {
	if (!frequencyHours) return { frequency: '', customFrequencyHours: '' };
	const fixed = String(frequencyHours);
	return FIXED_FREQUENCIES.includes(fixed)
		? { frequency: fixed, customFrequencyHours: '' }
		: { frequency: CUSTOM_FREQUENCY, customFrequencyHours: fixed };
}

const toText = (value?: number) => (value === undefined ? '' : String(value));

/** The name is not stored with a draft: the form fills it from the medication catalog. */
export function toMedicationFormValues(
	medication: TreatmentMedicationPayload
): MedicationOrderFormValues {
	const startsAt = medication.startsAt ? new Date(medication.startsAt) : null;
	const hasStart = !!startsAt && !Number.isNaN(startsAt.getTime());
	return {
		medicationId: medication.medicationId ?? NEW_MEDICATION.medicationId,
		medicationName: NEW_MEDICATION.medicationName,
		dose: toText(medication.dose),
		doseUnit: medication.doseUnit ?? NEW_MEDICATION.doseUnit,
		route: medication.route ?? NEW_MEDICATION.route,
		...toFrequencyFormValues(medication.frequencyHours),
		durationValue: toText(medication.durationValue),
		durationUnit: medication.durationUnit ?? NEW_MEDICATION.durationUnit,
		startDate: hasStart ? format(startsAt, 'yyyy-MM-dd') : '',
		startTime: hasStart ? format(startsAt, 'HH:mm') : '',
		context: medication.context ?? NEW_MEDICATION.context,
		firstDoseInConsultation: !!medication.firstDoseInConsultation,
		instructions: medication.instructions ?? NEW_MEDICATION.instructions,
	};
}

export function toTreatmentFormValues(
	treatments: DraftTreatment[]
): TreatmentFormValues[] {
	return treatments.map((treatment) => ({
		diagnosis: treatment.diagnosis ?? '',
		ownerInstructions: treatment.ownerInstructions ?? '',
		internalNotes: treatment.internalNotes ?? '',
		medications: treatment.medications.map(toMedicationFormValues),
	}));
}

export interface RegisterApplicationPayload {
	administeredAt: string;
	dose: number;
	doseUnit: DoseUnit;
	route: AdministrationRoute;
	site?: string;
	notes?: string;
	adjustmentReason?: string;
	adverseReaction?: {
		description: string;
		severity: AdverseReactionSeverity;
		action?: string;
	};
}

export function toApplicationPayload(
	values: ApplicationFormValues
): RegisterApplicationPayload {
	return {
		administeredAt: new Date(`${values.date}T${values.time}`).toISOString(),
		dose: Number(values.dose),
		doseUnit: values.doseUnit,
		route: values.route,
		site: toOptionalText(values.site),
		notes: toOptionalText(values.notes),
		adjustmentReason: toOptionalText(values.adjustmentReason),
		adverseReaction:
			values.hasAdverseReaction && values.reactionSeverity
				? {
						description: values.reactionDescription.trim(),
						severity: values.reactionSeverity,
						action: toOptionalText(values.reactionAction),
					}
				: undefined,
	};
}

type ControlDecisionBase = { planId: string; expectedUpdatedAt?: string };

export type ControlDecisionPayload =
	| (ControlDecisionBase & { decision: 'CONTINUE' })
	| (ControlDecisionBase & {
			decision: 'MODIFY';
			replacedOrderIds: string[];
			changeReason: string;
			medications: TreatmentMedicationPayload[];
	  })
	| (ControlDecisionBase & {
			decision: 'FINISH';
			outcome?: TreatmentOutcome;
			outcomeNotes?: string;
	  });

export interface RegisterControlPayload {
	reason: string;
	evolution: FollowUpEvolution;
	weightKg?: number;
	temperatureC?: number;
	clinicalNotes?: string;
	treatmentResponse?: string;
	decisions: ControlDecisionPayload[];
	nextFollowUp?: { recommendedDate: string; reason: string };
}

function toDecisionPayload(
	item: ControlFormValues['decisions'][number],
	medications: MedicationOrderFormValues[]
): ControlDecisionPayload {
	const base = {
		planId: item.planId,
		expectedUpdatedAt: toOptionalText(item.expectedUpdatedAt),
	};
	if (item.decision === 'MODIFY')
		return {
			...base,
			decision: 'MODIFY',
			replacedOrderIds: item.replacedOrderIds,
			changeReason: item.stopReason.trim(),
			medications: medications.map(toMedicationPayload),
		};
	if (item.decision === 'FINISH')
		return {
			...base,
			decision: 'FINISH',
			outcome: item.outcome || undefined,
			outcomeNotes: toOptionalText(item.outcomeNotes),
		};
	return { ...base, decision: 'CONTINUE' };
}

export function toControlPayload(
	values: ControlFormValues
): RegisterControlPayload {
	return {
		reason: values.reason.trim(),
		evolution: values.evolution,
		weightKg: toOptionalNumber(values.weightKg),
		temperatureC: toOptionalNumber(values.temperatureC),
		clinicalNotes: toOptionalText(values.observations),
		treatmentResponse: toOptionalText(values.treatmentResponse),
		decisions: values.decisions.map((item, index) =>
			toDecisionPayload(item, values.treatments[index]?.medications ?? [])
		),
		nextFollowUp: values.requiresFollowUp
			? {
					recommendedDate: values.followUpDate,
					reason: values.followUpReason.trim(),
				}
			: undefined,
	};
}
