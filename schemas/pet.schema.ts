import { z } from 'zod';
import { optionalNumber } from './optional-number';

export const petFormSchema = z.object({
	name: z.string().min(1, { message: 'Ingresa el nombre de la mascota' }),
	species: z.string().min(1, { message: 'Ingresa la especie' }),
	breed: z.string(),
	sex: z.string(),
	sterilized: z.boolean(),
	birthDate: z
		.string()
		.min(1, { message: 'Selecciona la fecha de nacimiento' })
		.refine((value) => !value || new Date(value) <= new Date(), {
			message: 'La fecha no puede ser futura',
		}),
	weightKg: optionalNumber('Ingresa un peso mayor a 0'),
	color: z.string().max(60, { message: 'Máximo 60 caracteres' }),
	markings: z.string().max(300, { message: 'Máximo 300 caracteres' }),
	microchip: z.string().max(40, { message: 'Máximo 40 caracteres' }),
	notes: z.string().max(2000).optional(),
});

export type PetFormValues = z.infer<typeof petFormSchema>;
