import {
	AdministrationContext,
	AdministrationRoute,
	AdverseReactionSeverity,
	DoseUnit,
	DurationUnit,
	FollowUpEvolution,
	TreatmentOutcome,
} from '@/constants/enum';
import {
	CUSTOM_FREQUENCY,
	INJECTABLE_ROUTES,
	MAX_DURATION,
	PRN_FREQUENCY,
} from '@/constants/treatment';
import { countApplications, resolveFrequencyHours } from '@/utils/treatment';
import { format } from 'date-fns';
import { z } from 'zod';
import { optionalNumber } from './optional-number';

const requiredNumber = (message: string, integer = false) =>
	optionalNumber(message, integer).refine((value) => !!value.trim(), {
		message,
	});

const addIssue = (ctx: z.RefinementCtx, path: string, message: string) =>
	ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

export const medicationOrderFormSchema = z
	.object({
		medicationId: z.string().min(1, { message: 'Selecciona el medicamento' }),
		medicationName: z.string(),
		dose: requiredNumber('Ingresa una dosis mayor a 0'),
		doseUnit: z.nativeEnum(DoseUnit, { message: 'Selecciona la unidad' }),
		route: z.nativeEnum(AdministrationRoute, { message: 'Selecciona la vía' }),
		frequency: z.string().min(1, { message: 'Selecciona la frecuencia' }),
		customFrequencyHours: optionalNumber(
			'Ingresa un número entero de horas mayor a 0',
			true
		),
		durationValue: requiredNumber(
			'Ingresa una duración entera mayor a 0',
			true
		),
		durationUnit: z.nativeEnum(DurationUnit, {
			message: 'Selecciona la unidad de duración',
		}),
		startDate: z.string().min(1, { message: 'Selecciona la fecha de inicio' }),
		startTime: z.string().min(1, { message: 'Selecciona la hora de inicio' }),
		context: z.nativeEnum(AdministrationContext, {
			message: 'Selecciona dónde se administra',
		}),
		firstDoseInConsultation: z.boolean(),
		instructions: z
			.string()
			.trim()
			.min(1, { message: 'Escribe las indicaciones para el propietario' })
			.max(1000, { message: 'Máximo 1000 caracteres' }),
	})
	.superRefine((values, ctx) => {
		if (
			values.frequency === CUSTOM_FREQUENCY &&
			!values.customFrequencyHours.trim()
		)
			addIssue(ctx, 'customFrequencyHours', 'Ingresa cada cuántas horas');

		if (Number(values.durationValue) > MAX_DURATION[values.durationUnit])
			addIssue(ctx, 'durationValue', 'Duración demasiado larga');

		const frequencyHours = resolveFrequencyHours(values);
		if (!frequencyHours && values.durationUnit === DurationUnit.APPLICATIONS)
			addIssue(
				ctx,
				'durationUnit',
				'Según necesidad no admite duración en aplicaciones'
			);
		const applications = countApplications({
			frequencyHours,
			durationValue: Number(values.durationValue),
			durationUnit: values.durationUnit,
			context: values.context,
		});
		if (
			values.context === AdministrationContext.CLINIC &&
			frequencyHours &&
			applications < 1
		)
			addIssue(
				ctx,
				'durationValue',
				'La duración es menor que el intervalo entre dosis'
			);

		if (!INJECTABLE_ROUTES.includes(values.route)) return;
		if (values.context !== AdministrationContext.CLINIC)
			addIssue(ctx, 'context', 'Las inyecciones se aplican en la clínica');
		if (values.frequency === PRN_FREQUENCY)
			addIssue(
				ctx,
				'frequency',
				'Una inyección necesita una frecuencia determinada'
			);
	});

export const treatmentFormSchema = z.object({
	diagnosis: z
		.string()
		.trim()
		.min(1, { message: 'Indica el diagnóstico relacionado' })
		.max(160, { message: 'Máximo 160 caracteres' }),
	ownerInstructions: z
		.string()
		.max(2000, { message: 'Máximo 2000 caracteres' }),
	internalNotes: z.string().max(2000, { message: 'Máximo 2000 caracteres' }),
	medications: z
		.array(medicationOrderFormSchema)
		.min(1, { message: 'Agrega al menos un medicamento' }),
});

export const applicationFormSchema = z
	.object({
		date: z.string().min(1, { message: 'Selecciona la fecha' }),
		time: z.string().min(1, { message: 'Selecciona la hora' }),
		dose: requiredNumber('Ingresa una dosis mayor a 0'),
		prescribedDose: z.string(),
		prescribedDoseUnit: z.nativeEnum(DoseUnit),
		prescribedRoute: z.nativeEnum(AdministrationRoute),
		doseUnit: z.nativeEnum(DoseUnit, { message: 'Selecciona la unidad' }),
		route: z.nativeEnum(AdministrationRoute, { message: 'Selecciona la vía' }),
		site: z.string(),
		adjustmentReason: z.string().max(300, { message: 'Máximo 300 caracteres' }),
		notes: z.string().max(1000, { message: 'Máximo 1000 caracteres' }),
		hasAdverseReaction: z.boolean(),
		reactionDescription: z
			.string()
			.max(500, { message: 'Máximo 500 caracteres' }),
		reactionSeverity: z.union([
			z.nativeEnum(AdverseReactionSeverity),
			z.literal(''),
		]),
		reactionAction: z.string().max(500, { message: 'Máximo 500 caracteres' }),
	})
	.superRefine((values, ctx) => {
		const needsSite =
			values.route === AdministrationRoute.IM ||
			values.route === AdministrationRoute.SC;
		if (needsSite && !values.site.trim())
			addIssue(ctx, 'site', 'Indica el sitio de aplicación');

		const differs =
			Number(values.dose) !== Number(values.prescribedDose) ||
			values.doseUnit !== values.prescribedDoseUnit ||
			values.route !== values.prescribedRoute;
		if (values.prescribedDose && differs && !values.adjustmentReason.trim())
			addIssue(ctx, 'adjustmentReason', 'Indica el motivo del ajuste');

		if (!values.hasAdverseReaction) return;
		if (!values.reactionDescription.trim())
			addIssue(ctx, 'reactionDescription', 'Describe la reacción');
		if (!values.reactionSeverity)
			addIssue(ctx, 'reactionSeverity', 'Selecciona la severidad');
	});

export const skipApplicationSchema = z.object({
	reason: z
		.string()
		.trim()
		.min(1, { message: 'Indica el motivo para omitir la aplicación' })
		.max(300, { message: 'Máximo 300 caracteres' }),
});

export const closeTreatmentSchema = z.object({
	outcome: z.union([z.nativeEnum(TreatmentOutcome), z.literal('')]),
	reason: z.string().trim().max(500, { message: 'Máximo 500 caracteres' }),
});

export const CONTROL_DECISIONS = ['CONTINUE', 'MODIFY', 'FINISH'] as const;

export type ControlDecision = (typeof CONTROL_DECISIONS)[number];

export const controlFormSchema = z
	.object({
		reason: z
			.string()
			.trim()
			.min(1, { message: 'Indica el motivo del control' })
			.max(500, { message: 'Máximo 500 caracteres' }),
		evolution: z.nativeEnum(FollowUpEvolution, {
			message: 'Selecciona la evolución',
		}),
		weightKg: optionalNumber('Ingresa un peso mayor a 0'),
		temperatureC: optionalNumber('Ingresa una temperatura mayor a 0'),
		observations: z.string().max(5000, { message: 'Máximo 5000 caracteres' }),
		treatmentResponse: z
			.string()
			.max(2000, { message: 'Máximo 2000 caracteres' }),
		decision: z.enum(CONTROL_DECISIONS, {
			message: 'Selecciona la decisión sobre el tratamiento',
		}),
		stopReason: z.string().max(300, { message: 'Máximo 300 caracteres' }),
		replacedOrderIds: z.array(z.string()),
		outcome: z.union([z.nativeEnum(TreatmentOutcome), z.literal('')]),
		outcomeNotes: z.string().max(500, { message: 'Máximo 500 caracteres' }),
		// Misma forma que la consulta para reutilizar MedicationOrderFields; se validan solo al modificar.
		treatments: z.array(
			z.object({ medications: z.array(z.custom<MedicationOrderFormValues>()) })
		),
		requiresFollowUp: z.boolean(),
		followUpDate: z.string(),
		followUpReason: z.string().max(300, { message: 'Máximo 300 caracteres' }),
	})
	.superRefine((values, ctx) => {
		if (values.decision === 'MODIFY') {
			if (!values.replacedOrderIds.length)
				addIssue(
					ctx,
					'replacedOrderIds',
					'Selecciona al menos un medicamento a reemplazar'
				);
			if (!values.stopReason.trim())
				addIssue(ctx, 'stopReason', 'Indica el motivo del cambio');
			const medications = values.treatments[0]?.medications ?? [];
			if (!medications.length)
				addIssue(ctx, 'treatments', 'Agrega la nueva indicación');
			medications.forEach((medication, index) => {
				const parsed = medicationOrderFormSchema.safeParse(medication);
				if (parsed.success) return;
				parsed.error.issues.forEach((issue) =>
					ctx.addIssue({
						...issue,
						path: ['treatments', 0, 'medications', index, ...issue.path],
					})
				);
			});
		}
		if (values.decision === 'FINISH' && !values.outcome)
			addIssue(ctx, 'outcome', 'Selecciona el resultado');
		if (values.requiresFollowUp && !values.followUpReason.trim())
			addIssue(ctx, 'followUpReason', 'Indica el motivo del nuevo control');
		if (values.requiresFollowUp && !values.followUpDate)
			addIssue(ctx, 'followUpDate', 'Selecciona la fecha del nuevo control');
		else if (
			values.requiresFollowUp &&
			values.followUpDate <= format(new Date(), 'yyyy-MM-dd')
		)
			addIssue(ctx, 'followUpDate', 'La fecha debe ser futura');
	});

export type MedicationOrderFormValues = z.infer<
	typeof medicationOrderFormSchema
>;
export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
export type SkipApplicationFormValues = z.infer<typeof skipApplicationSchema>;
export type CloseTreatmentFormValues = z.infer<typeof closeTreatmentSchema>;
export type ControlFormValues = z.infer<typeof controlFormSchema>;
