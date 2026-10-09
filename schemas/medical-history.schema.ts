import { MedicalHistoryStatus, MedicalHistoryType } from '@/constants/enum';
import { z } from 'zod';

export const medicalHistoryFormSchema = z
	.object({
		type: z.nativeEnum(MedicalHistoryType, {
			message: 'Selecciona el tipo de antecedente',
		}),
		name: z
			.string()
			.trim()
			.min(2, { message: 'Ingresa al menos 2 caracteres' })
			.max(120, { message: 'Máximo 120 caracteres' }),
		approximateDate: z
			.string()
			.refine((value) => !value || new Date(value) <= new Date(), {
				message: 'La fecha no puede ser futura',
			}),
		status: z.nativeEnum(MedicalHistoryStatus, {
			message: 'Selecciona el estado',
		}),
		description: z.string().max(2000, { message: 'Máximo 2000 caracteres' }),
		isAlert: z.boolean(),
		alertType: z.string(),
	})
	.refine((values) => !values.isAlert || !!values.alertType, {
		message: 'Selecciona el tipo de alerta',
		path: ['alertType'],
	});

export type MedicalHistoryFormValues = z.infer<typeof medicalHistoryFormSchema>;
