import { z } from 'zod';

export const petFormSchema = z.object({
	name: z.string().min(1, { message: 'Ingresa el nombre de la mascota' }),
	species: z.string().min(1, { message: 'Ingresa la especie' }),
	breed: z.string().min(1, { message: 'Ingresa la raza' }),
	birthDate: z
		.string()
		.min(1, { message: 'Selecciona la fecha de nacimiento' }),
	notes: z.string().max(2000).optional(),
});

export type PetFormValues = z.infer<typeof petFormSchema>;
