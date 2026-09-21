import { z } from 'zod';

export const appointmentFormSchema = z.object({
	petId: z.string().min(1, { message: 'Selecciona una mascota' }),
	serviceId: z.string().min(1, { message: 'Selecciona un servicio' }),
	date: z.string().min(1, { message: 'Selecciona una fecha' }),
	time: z.string().min(1, { message: 'Selecciona una hora' }),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
