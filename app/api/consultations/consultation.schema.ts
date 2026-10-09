import {
	CAPILLARY_REFILL_OPTIONS,
	HYDRATION_OPTIONS,
	MUCOUS_MEMBRANE_OPTIONS,
	PAIN_OPTIONS,
	PROGNOSIS_OPTIONS,
	type SelectOption,
} from '@/constants/clinical';
import {
	ConsultationKind,
	DiagnosisSeverity,
	DiagnosisStatus,
	DiagnosisType,
} from '@/constants/enum';
import { z } from 'zod';
import { weightKgSchema } from './clinical-measurement.schema';

const optionValue = (options: SelectOption[]) =>
	z
		.string()
		.refine((value) => options.some((option) => option.value === value), {
			message: 'Invalid option',
		});

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
	.refine(
		(value) => new Date(`${value}T00:00:00Z`).toISOString().startsWith(value),
		{
			message: 'Invalid calendar date',
		}
	);

export const consultationMeasurementsSchema = z.object({
	weightKg: weightKgSchema.optional(),
	temperatureC: z.number().positive().max(60).optional(),
	heartRateBpm: z.number().int().positive().max(1000).optional(),
	respiratoryRateRpm: z.number().int().positive().max(500).optional(),
	bodyConditionScore: z.number().int().min(1).max(9).optional(),
	hydration: optionValue(HYDRATION_OPTIONS).optional(),
	mucousMembranes: optionValue(MUCOUS_MEMBRANE_OPTIONS).optional(),
	mucousMembranesOther: z.string().trim().max(120).optional(),
	capillaryRefill: optionValue(CAPILLARY_REFILL_OPTIONS).optional(),
	pain: optionValue(PAIN_OPTIONS).optional(),
});

/** A draft may hold an unnamed diagnosis; finalizing requires a name. */
export const consultationDiagnosisSchema = z.object({
	name: z.string().trim().max(160),
	type: z.nativeEnum(DiagnosisType),
	status: z.nativeEnum(DiagnosisStatus),
	severity: z.nativeEnum(DiagnosisSeverity).optional(),
	notes: z.string().max(1000).optional(),
	isActiveProblem: z.boolean(),
});

export const consultationFollowUpSchema = z.object({
	recommendedDate: isoDate,
	reason: z.string().trim().min(1).max(300),
});

const contentFields = {
	kind: z.nativeEnum(ConsultationKind).optional(),
	reason: z.string().max(500).optional(),
	anamnesis: z.string().max(5000).optional(),
	measurements: consultationMeasurementsSchema.default({}),
	physicalExam: z.string().max(5000).optional(),
	diagnoses: z.array(consultationDiagnosisSchema).max(20).default([]),
	noDefinedDiagnosis: z.boolean().default(false),
	instructions: z.string().max(5000).optional(),
	internalNotes: z.string().max(5000).optional(),
	prognosis: optionValue(PROGNOSIS_OPTIONS).optional(),
	followUp: consultationFollowUpSchema.optional(),
};

/** Clinical content of a consultation; the document id is the encounter id. */
export const consultationSchema = z.object({
	petId: z.string().min(1),
	...contentFields,
	createdAt: z.string(),
	createdBy: z.string(),
	updatedAt: z.string(),
	updatedBy: z.string(),
});

/**
 * Staff payload for a draft — `status` and audit fields are set server-side.
 * `staffId` defaults to the caller. Everything clinical may be incomplete
 * until the consultation is finalized.
 */
export const createConsultationSchema = z.object({
	occurredAt: z.string().datetime(),
	staffId: z.string().min(1).optional(),
	appointmentId: z.string().min(1).optional(),
	...contentFields,
});

/**
 * `PATCH` replaces the draft's content: an omitted field is cleared, except
 * `staffId`, which keeps its current value. `expectedUpdatedAt` is optional
 * optimistic concurrency: when sent and it no longer matches, the edit is
 * rejected with 409 instead of overwriting someone else's changes.
 */
export const updateConsultationSchema = createConsultationSchema.extend({
	expectedUpdatedAt: z.string().optional(),
});

/** Minimum content a draft must have before it becomes part of the history. */
export const finalizeConsultationSchema = z
	.object({
		occurredAt: z.string(),
		kind: z.nativeEnum(ConsultationKind),
		reason: z.string().trim().min(10),
		anamnesis: z.string().trim().min(1),
		physicalExam: z.string().trim().min(1),
		instructions: z.string().trim().min(1),
		diagnoses: z.array(z.object({ name: z.string().trim().min(1) })),
		noDefinedDiagnosis: z.boolean(),
		measurements: z.object({
			mucousMembranes: z.string().optional(),
			mucousMembranesOther: z.string().trim().optional(),
		}),
		followUp: z.object({ recommendedDate: z.string() }).optional(),
	})
	.superRefine((value, ctx) => {
		const issue = (path: (string | number)[], message: string) =>
			ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

		if (value.noDefinedDiagnosis && value.diagnoses.length > 0)
			issue(
				['noDefinedDiagnosis'],
				'Cannot combine noDefinedDiagnosis with diagnoses'
			);
		if (!value.noDefinedDiagnosis && value.diagnoses.length === 0)
			issue(['diagnoses'], 'Add a diagnosis or mark noDefinedDiagnosis');
		if (
			value.measurements.mucousMembranes === 'OTHER' &&
			!value.measurements.mucousMembranesOther
		)
			issue(
				['measurements', 'mucousMembranesOther'],
				'Describe the mucous membranes'
			);
		if (
			value.followUp &&
			value.followUp.recommendedDate < value.occurredAt.slice(0, 10)
		)
			issue(
				['followUp', 'recommendedDate'],
				'Follow-up date cannot be before the consultation'
			);
	});

export type ConsultationContent = z.infer<typeof consultationSchema>;
export type ConsultationMeasurements = z.infer<
	typeof consultationMeasurementsSchema
>;
export type ConsultationDiagnosis = z.infer<typeof consultationDiagnosisSchema>;
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
