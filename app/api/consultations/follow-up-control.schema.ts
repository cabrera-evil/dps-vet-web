import { FollowUpEvolution, TreatmentOutcome } from '@/constants/enum';
import { z } from 'zod';
import {
	MAX_MEDICATIONS_PER_PLAN,
	MAX_PLAN_LIST_SIZE,
	medicationOrderInputSchema,
	optionalText,
} from '../treatment-plans/treatment-plan.schema';
import { weightKgSchema } from './clinical-measurement.schema';
import { isoDate } from './consultation.schema';

export const followUpControlDecisionSchema = z.object({
	planId: z.string().min(1),
	decision: z.enum(['CONTINUE', 'MODIFY', 'FINISH']),
});

/** Stored under the follow-up's id: at most one control per follow-up. */
export const followUpControlSchema = z.object({
	petId: z.string().min(1),
	followUpId: z.string().min(1),
	treatmentPlanIds: z.array(z.string().min(1)),
	reason: z.string().min(1),
	evolution: z.nativeEnum(FollowUpEvolution),
	weightKg: z.number().positive().optional(),
	temperatureC: z.number().optional(),
	clinicalNotes: z.string().optional(),
	treatmentResponse: z.string().optional(),
	decisions: z.array(followUpControlDecisionSchema),
	// The original follow-up's recommended date
	recommendedDate: z.string(),
	nextFollowUpId: z.string().optional(),
	registeredAt: z.string(),
	registeredBy: z.string(),
	registeredByName: z.string(),
	createdAt: z.string(),
});

export type FollowUpControlDecision = z.infer<
	typeof followUpControlDecisionSchema
>;
export type FollowUpControl = z.infer<typeof followUpControlSchema>;

const MAX_REPLACED_ORDERS = 100;

const decisionBase = {
	planId: z.string().trim().min(1),
	expectedUpdatedAt: z.string().optional(),
};

const controlDecisionInputSchema = z.discriminatedUnion('decision', [
	z.object({ ...decisionBase, decision: z.literal('CONTINUE') }),
	z.object({
		...decisionBase,
		decision: z.literal('MODIFY'),
		replacedOrderIds: z
			.array(z.string().min(1))
			.min(1)
			.max(MAX_REPLACED_ORDERS),
		changeReason: z.string().trim().min(1).max(300),
		medications: z
			.array(medicationOrderInputSchema)
			.min(1)
			.max(MAX_MEDICATIONS_PER_PLAN),
	}),
	z.object({
		...decisionBase,
		decision: z.literal('FINISH'),
		outcome: z.nativeEnum(TreatmentOutcome).optional(),
		outcomeNotes: optionalText(500),
	}),
]);

export const registerControlInputSchema = z.object({
	reason: z.string().trim().min(1).max(300),
	evolution: z.nativeEnum(FollowUpEvolution),
	weightKg: weightKgSchema.optional(),
	temperatureC: z.number().positive().max(60).optional(),
	clinicalNotes: optionalText(2000),
	treatmentResponse: optionalText(2000),
	decisions: z.array(controlDecisionInputSchema).max(MAX_PLAN_LIST_SIZE),
	nextFollowUp: z
		.object({
			recommendedDate: isoDate,
			reason: z.string().trim().min(1).max(300),
		})
		.optional(),
});

export type ControlDecisionInput = z.infer<typeof controlDecisionInputSchema>;
export type RegisterControlInput = z.infer<typeof registerControlInputSchema>;
