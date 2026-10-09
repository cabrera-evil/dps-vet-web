import { CONSULTATION_KIND_LABEL } from '@/constants/clinical';
import type { ConsultationKind } from '@/constants/enum';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import type { ConsultationRecord } from '@/types/consultation.type';
import { format, parseISO } from 'date-fns';

export function getConsultationKindLabel(kind?: ConsultationKind) {
	return kind ? CONSULTATION_KIND_LABEL[kind] : 'Consulta';
}

const toText = (value?: number | string) =>
	value === undefined ? '' : String(value);

const toNumber = (value: string) => (value.trim() ? Number(value) : undefined);

const toOptional = (value: string) => value.trim() || undefined;

export function buildConsultationFormValues(
	consultation?: ConsultationRecord
): ConsultationFormValues {
	const occurredAt = consultation && parseISO(consultation.occurredAt);
	const measurements = consultation?.measurements;
	return {
		date: occurredAt ? format(occurredAt, 'yyyy-MM-dd') : '',
		time: occurredAt ? format(occurredAt, 'HH:mm') : '',
		staffId: consultation?.staffId ?? '',
		appointmentId: consultation?.appointmentId ?? '',
		kind: consultation?.kind ?? '',
		reason: consultation?.reason ?? '',
		anamnesis: consultation?.anamnesis ?? '',
		weightKg: toText(measurements?.weightKg),
		temperatureC: toText(measurements?.temperatureC),
		heartRateBpm: toText(measurements?.heartRateBpm),
		respiratoryRateRpm: toText(measurements?.respiratoryRateRpm),
		bodyConditionScore: toText(measurements?.bodyConditionScore),
		hydration: measurements?.hydration ?? '',
		mucousMembranes: measurements?.mucousMembranes ?? '',
		mucousMembranesOther: measurements?.mucousMembranesOther ?? '',
		capillaryRefill: measurements?.capillaryRefill ?? '',
		pain: measurements?.pain ?? '',
		physicalExam: consultation?.physicalExam ?? '',
		diagnoses:
			consultation?.diagnoses.map((diagnosis) => ({
				name: diagnosis.name,
				type: diagnosis.type,
				status: diagnosis.status,
				severity: diagnosis.severity ?? '',
				notes: diagnosis.notes ?? '',
				isActiveProblem: diagnosis.isActiveProblem,
			})) ?? [],
		noDefinedDiagnosis: consultation?.noDefinedDiagnosis ?? false,
		instructions: consultation?.instructions ?? '',
		internalNotes: consultation?.internalNotes ?? '',
		prognosis: consultation?.prognosis ?? '',
		requiresFollowUp: !!consultation?.followUp,
		followUpDate: consultation?.followUp?.recommendedDate ?? '',
		followUpReason: consultation?.followUp?.reason ?? '',
		treatments: [],
	};
}

/**
 * Form values → API body. `PATCH` replaces the draft, so every empty field is
 * omitted (nested ones here; the REST client drops empty top-level strings).
 */
export function buildConsultationPayload(
	values: ConsultationFormValues,
	expectedUpdatedAt?: string
) {
	return {
		occurredAt: new Date(`${values.date}T${values.time}`).toISOString(),
		staffId: toOptional(values.staffId),
		appointmentId: toOptional(values.appointmentId),
		kind: toOptional(values.kind),
		reason: values.reason,
		anamnesis: values.anamnesis,
		measurements: {
			weightKg: toNumber(values.weightKg),
			temperatureC: toNumber(values.temperatureC),
			heartRateBpm: toNumber(values.heartRateBpm),
			respiratoryRateRpm: toNumber(values.respiratoryRateRpm),
			bodyConditionScore: toNumber(values.bodyConditionScore),
			hydration: toOptional(values.hydration),
			mucousMembranes: toOptional(values.mucousMembranes),
			mucousMembranesOther:
				values.mucousMembranes === 'OTHER'
					? toOptional(values.mucousMembranesOther)
					: undefined,
			capillaryRefill: toOptional(values.capillaryRefill),
			pain: toOptional(values.pain),
		},
		physicalExam: values.physicalExam,
		diagnoses: values.diagnoses.map((diagnosis) => ({
			name: diagnosis.name,
			type: diagnosis.type,
			status: diagnosis.status,
			severity: toOptional(diagnosis.severity),
			notes: toOptional(diagnosis.notes),
			isActiveProblem: diagnosis.isActiveProblem,
		})),
		noDefinedDiagnosis: values.noDefinedDiagnosis,
		instructions: values.instructions,
		internalNotes: values.internalNotes,
		prognosis: toOptional(values.prognosis),
		followUp: values.requiresFollowUp
			? {
					recommendedDate: values.followUpDate,
					reason: values.followUpReason,
				}
			: undefined,
		expectedUpdatedAt,
	};
}
