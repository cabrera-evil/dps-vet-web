import { z } from 'zod';

export const medicationFormSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Ingresa el nombre del medicamento' })
		.max(120),
	description: z
		.string()
		.min(1, { message: 'Ingresa la descripción' })
		.max(2000),
	stock: z.coerce
		.number({ message: 'Ingresa el stock' })
		.int({ message: 'El stock debe ser un número entero' })
		.nonnegative({ message: 'El stock no puede ser negativo' }),
	price: z.coerce
		.number({ message: 'Ingresa el precio' })
		.nonnegative({ message: 'El precio no puede ser negativo' }),
	active: z.boolean(),
});

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;
