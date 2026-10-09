import { z } from 'zod';

export const patientGeneralDataFormSchema = z.object({
	name: z.string().trim().min(1, { message: 'Ingresa el nombre' }).max(120),
	species: z.string().min(1, { message: 'Selecciona la especie' }),
	breed: z.string().min(1, { message: 'Selecciona la raza' }),
	sex: z.string().min(1, { message: 'Selecciona el sexo' }),
	sterilized: z.boolean(),
	birthDate: z
		.string()
		.min(1, { message: 'Selecciona la fecha de nacimiento' })
		.refine((value) => new Date(value) <= new Date(), {
			message: 'La fecha no puede ser futura',
		}),
	color: z.string().max(60, { message: 'Máximo 60 caracteres' }),
	markings: z.string().max(300, { message: 'Máximo 300 caracteres' }),
	microchip: z.string().max(40, { message: 'Máximo 40 caracteres' }),
});

export type PatientGeneralDataFormValues = z.infer<
	typeof patientGeneralDataFormSchema
>;
