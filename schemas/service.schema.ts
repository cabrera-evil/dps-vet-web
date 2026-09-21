import { z } from 'zod';

export const serviceFormSchema = z.object({
	name: z.string().min(1, { message: 'Ingresa el nombre del servicio' }),
	description: z
		.string()
		.min(1, { message: 'Ingresa la descripción' })
		.max(2000),
	category: z.string().min(1, { message: 'Ingresa la categoría' }).max(60),
	durationMinutes: z.coerce
		.number({ message: 'Ingresa la duración en minutos' })
		.int()
		.positive({ message: 'La duración debe ser mayor a 0' })
		.max(1440),
	price: z.coerce
		.number({ message: 'Ingresa el precio' })
		.nonnegative({ message: 'El precio no puede ser negativo' }),
	active: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
