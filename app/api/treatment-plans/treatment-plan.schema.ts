import {
	AdministrationContext,
	AdministrationRoute,
	AdverseReactionSeverity,
	ApplicationStatus,
	DoseUnit,
	DurationUnit,
	TreatmentOutcome,
	TreatmentStatus,
} from '@/constants/enum';
import { MAX_DURATION } from '@/constants/treatment';
import { countApplications, isInjectable } from '@/utils/treatment';
import { z } from 'zod';

export const MAX_PLAN_LIST_SIZE = 30;
const MAX_FREQUENCY_HOURS = 720;
export const MAX_PLANS_PER_CONSULTATION = 10;
export const MAX_MEDICATIONS_PER_PLAN = 20;

/** Document ids cannot contain '/', be '.' or '..', or look like '__x__'. */
export const DOCUMENT_ID_PATTERN = /^(?!\.{1,2}$)(?!__.*__$)[^/]+$/;

const isSiteRequired = (route: AdministrationRoute) =>
	route === AdministrationRoute.IM || route === AdministrationRoute.SC;

const text = (max: number) => z.string().trim().max(max);

export const optionalText = (max: number) =>
	text(max)
		.optional()
		.transform((value) => value || undefined);

const audit = {
	createdAt: z.string(),
	createdBy: z.string(),
	updatedAt: z.string(),
	updatedBy: z.string(),
};

const medicationInputFields = {
	medicationId: z
		.string()
		.trim()
		.min(1)
		.regex(DOCUMENT_ID_PATTERN, 'Invalid medication id'),
	dose: z.number().positive(),
	doseUnit: z.nativeEnum(DoseUnit),
	route: z.nativeEnum(AdministrationRoute),
	frequencyHours: z
		.number()
		.int()
		.positive()
		.max(MAX_FREQUENCY_HOURS)
		.optional(),
	durationValue: z.number().int().positive(),
	durationUnit: z.nativeEnum(DurationUnit),
	startsAt: z.string().datetime(),
	context: z.nativeEnum(AdministrationContext),
	firstDoseInConsultation: z.boolean().optional(),
	instructions: text(1000).min(1),
};

type MedicationRuleFields = Pick<
	z.infer<z.ZodObject<typeof medicationInputFields>>,
	'route' | 'context' | 'frequencyHours' | 'durationValue' | 'durationUnit'
>;

/** Business rules shared by every medication order the server accepts. */
export function applyMedicationRules(
	value: MedicationRuleFields,
	ctx: z.RefinementCtx
): void {
	const issue = (path: string, message: string) =>
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
	const isPrn = value.frequencyHours === undefined;
	const isClinic = value.context === AdministrationContext.CLINIC;

	if (isInjectable(value.route)) {
		if (!isClinic)
			issue('context', 'Injectable medications are only given at the clinic');
		if (isPrn)
			issue('frequencyHours', 'Injectable medications need a frequency');
	}
	if (isPrn && value.durationUnit === DurationUnit.APPLICATIONS)
		issue('durationUnit', 'As-needed medications cannot last in applications');
	if (value.durationValue > MAX_DURATION[value.durationUnit])
		issue(
			'durationValue',
			`Duration cannot exceed ${MAX_DURATION[value.durationUnit]}`
		);
	if (isClinic && !isPrn && countApplications(value) < 1)
		issue('durationValue', 'The schedule must yield at least one application');
}

/** The flag only holds for clinic medications with a schedule; otherwise it is dropped. */
export const medicationOrderInputSchema = z
	.object(medicationInputFields)
	.superRefine(applyMedicationRules)
	.transform((value) => ({
		...value,
		firstDoseInConsultation:
			value.context === AdministrationContext.CLINIC &&
			value.frequencyHours !== undefined &&
			value.firstDoseInConsultation
				? true
				: undefined,
	}));

export const treatmentPlanInputSchema = z.object({
	diagnosis: text(300).min(1),
	ownerInstructions: text(2000).optional(),
	internalNotes: text(2000).optional(),
	medications: z
		.array(medicationOrderInputSchema)
		.min(1)
		.max(MAX_MEDICATIONS_PER_PLAN),
});

export const createTreatmentInputSchema = z
	.array(treatmentPlanInputSchema)
	.max(MAX_PLANS_PER_CONSULTATION);

export const closeTreatmentSchema = z
	.object({
		action: z.enum(['COMPLETE', 'SUSPEND', 'CANCEL']),
		outcome: z.nativeEnum(TreatmentOutcome).optional(),
		reason: text(1000).optional(),
		expectedUpdatedAt: z.string().optional(),
	})
	.superRefine((value, ctx) => {
		if (value.action !== 'COMPLETE' && !value.reason)
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['reason'],
				message: 'A reason is required to suspend or cancel',
			});
	});

export const registerApplicationInputSchema = z
	.object({
		administeredAt: z.string().datetime(),
		dose: z.number().positive(),
		doseUnit: z.nativeEnum(DoseUnit),
		route: z.nativeEnum(AdministrationRoute),
		site: optionalText(120),
		notes: optionalText(1000),
		adjustmentReason: optionalText(300),
		adverseReaction: z
			.object({
				description: text(500).min(1),
				severity: z.nativeEnum(AdverseReactionSeverity),
				action: optionalText(500),
			})
			.optional(),
	})
	.superRefine((value, ctx) => {
		if (isSiteRequired(value.route) && !value.site)
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['site'],
				message: 'The application site is required for IM and SC routes',
			});
	});

export const skipApplicationInputSchema = z.object({
	reason: text(300).min(1),
});

export const medicationOrderSchema = z.object({
	...medicationInputFields,
	id: z.string().min(1),
	medicationName: z.string().min(1),
	status: z.nativeEnum(TreatmentStatus),
	stopReason: z.string().optional(),
	stoppedAt: z.string().optional(),
	replacedByOrderId: z.string().optional(),
});

export const treatmentOutcomeSchema = z.object({
	result: z.nativeEnum(TreatmentOutcome),
	notes: z.string().optional(),
	closedAt: z.string(),
});

export const treatmentPlanSchema = z.object({
	petId: z.string().min(1),
	sourceEncounterId: z.string().min(1),
	sourceConsultationLabel: z.string().min(1),
	followUpId: z.string().min(1).optional(),
	diagnosis: z.string().min(1),
	status: z.nativeEnum(TreatmentStatus),
	startsAt: z.string(),
	endsAt: z.string().optional(),
	ownerInstructions: z.string().optional(),
	internalNotes: z.string().optional(),
	orders: z.array(medicationOrderSchema),
	outcome: treatmentOutcomeSchema.optional(),
	...audit,
});

export const medicationAdministrationSchema = z.object({
	petId: z.string().min(1),
	treatmentPlanId: z.string().min(1),
	orderId: z.string().min(1),
	sequence: z.number().int().positive(),
	total: z.number().int().positive(),
	scheduledAt: z.string(),
	status: z.nativeEnum(ApplicationStatus),
	administeredAt: z.string().optional(),
	administeredBy: z.string().optional(),
	administeredByName: z.string().optional(),
	actualDose: z.number().positive().optional(),
	actualDoseUnit: z.nativeEnum(DoseUnit).optional(),
	actualRoute: z.nativeEnum(AdministrationRoute).optional(),
	site: z.string().optional(),
	notes: z.string().optional(),
	adjustmentReason: z.string().optional(),
	skipReason: z.string().optional(),
	adverseReaction: z
		.object({
			description: z.string().min(1),
			severity: z.nativeEnum(AdverseReactionSeverity),
			action: z.string().optional(),
		})
		.optional(),
	...audit,
});

export type TreatmentMedicationInput = z.infer<
	typeof medicationOrderInputSchema
>;
export type TreatmentPlanInput = z.infer<typeof treatmentPlanInputSchema>;
export type CreateTreatmentInput = z.infer<typeof createTreatmentInputSchema>;
export type CloseTreatmentInput = z.infer<typeof closeTreatmentSchema>;
export type RegisterApplicationInput = z.infer<
	typeof registerApplicationInputSchema
>;
export type SkipApplicationInput = z.infer<typeof skipApplicationInputSchema>;
export type MedicationOrderDocument = z.infer<typeof medicationOrderSchema>;
export type TreatmentPlanDocument = z.infer<typeof treatmentPlanSchema>;
export type MedicationAdministrationDocument = z.infer<
	typeof medicationAdministrationSchema
>;
