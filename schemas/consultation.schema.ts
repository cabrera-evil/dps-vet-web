import { DiagnosisStatus, DiagnosisType } from '@/constants/enum';
import { z } from 'zod';

const optionalNumber = (message: string, integer = false) =>
	z.string().refine(
		(value) => {
			if (!value.trim()) return true;
			const parsed = Number(value);
			return (
				Number.isFinite(parsed) &&
				parsed > 0 &&
				(!integer || Number.isInteger(parsed))
			);
		},
		{ message }
	);

export const diagnosisFormSchema = z.object({
	name: z.string().trim().max(160, { message: 'Máximo 160 caracteres' }),
	type: z.nativeEnum(DiagnosisType),
	status: z.nativeEnum(DiagnosisStatus),
	severity: z.string(),
	notes: z.string().max(1000, { message: 'Máximo 1000 caracteres' }),
	isActiveProblem: z.boolean(),
});

export const consultationDraftSchema = z.object({
	date: z.string().min(1, { message: 'Selecciona una fecha' }),
	time: z.string().min(1, { message: 'Selecciona una hora' }),
	staffId: z.string(),
	appointmentId: z.string(),
	kind: z.string(),
	reason: z.string().max(500, { message: 'Máximo 500 caracteres' }),
	anamnesis: z.string().max(5000, { message: 'Máximo 5000 caracteres' }),
	weightKg: optionalNumber('Ingresa un peso mayor a 0'),
	temperatureC: optionalNumber('Ingresa una temperatura mayor a 0'),
	heartRateBpm: optionalNumber('Ingresa un número entero mayor a 0', true),
	respiratoryRateRpm: optionalNumber(
		'Ingresa un número entero mayor a 0',
		true
	),
	bodyConditionScore: z.string(),
	hydration: z.string(),
	mucousMembranes: z.string(),
	mucousMembranesOther: z
		.string()
		.max(120, { message: 'Máximo 120 caracteres' }),
	capillaryRefill: z.string(),
	pain: z.string(),
	physicalExam: z.string().max(5000, { message: 'Máximo 5000 caracteres' }),
	diagnoses: z.array(diagnosisFormSchema),
	noDefinedDiagnosis: z.boolean(),
	instructions: z.string().max(5000, { message: 'Máximo 5000 caracteres' }),
	internalNotes: z.string().max(5000, { message: 'Máximo 5000 caracteres' }),
	prognosis: z.string(),
	requiresFollowUp: z.boolean(),
	followUpDate: z.string(),
	followUpReason: z.string().max(300, { message: 'Máximo 300 caracteres' }),
});

export const consultationFinalizeSchema = consultationDraftSchema.superRefine(
	(values, ctx) => {
		const required = (path: (string | number)[], message: string) =>
			ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

		if (!values.staffId) required(['staffId'], 'Selecciona el veterinario');
		if (!values.kind) required(['kind'], 'Selecciona el tipo de consulta');
		if (values.reason.trim().length < 10)
			required(['reason'], 'Describe el motivo (mínimo 10 caracteres)');
		if (!values.anamnesis.trim())
			required(['anamnesis'], 'Registra la anamnesis');
		if (!values.physicalExam.trim())
			required(['physicalExam'], 'Registra el examen físico');
		if (!values.instructions.trim())
			required(['instructions'], 'Registra las indicaciones');

		if (!values.noDefinedDiagnosis && values.diagnoses.length === 0)
			required(
				['noDefinedDiagnosis'],
				'Agrega un diagnóstico o marca «Sin diagnóstico definido»'
			);
		values.diagnoses.forEach((diagnosis, index) => {
			if (!diagnosis.name.trim())
				required(['diagnoses', index, 'name'], 'Ingresa el diagnóstico');
		});

		if (
			values.mucousMembranes === 'OTHER' &&
			!values.mucousMembranesOther.trim()
		)
			required(['mucousMembranesOther'], 'Describe las mucosas');

		if (values.requiresFollowUp) {
			if (!values.followUpDate)
				required(['followUpDate'], 'Selecciona la fecha recomendada');
			else if (values.date && values.followUpDate <= values.date)
				required(['followUpDate'], 'La fecha debe ser posterior a la consulta');
			if (!values.followUpReason.trim())
				required(['followUpReason'], 'Indica el motivo del seguimiento');
		}
	}
);

export type ConsultationFormValues = z.infer<typeof consultationDraftSchema>;
export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>;
