import { z } from 'zod';

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(1, { message: 'El nombre es obligatorio' })
			.max(120, { message: 'El nombre no debe exceder 120 caracteres' }),
		email: z
			.string()
			.email({ message: 'Ingresa un correo electrónico válido' }),
		phone: z
			.string()
			.min(1, { message: 'El teléfono es obligatorio' })
			.max(30, { message: 'El teléfono no debe exceder 30 caracteres' }),
		password: z
			.string()
			.min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
			.max(128, { message: 'La contraseña no debe exceder 128 caracteres' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
			.max(128, { message: 'La contraseña no debe exceder 128 caracteres' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});

export type Register = z.infer<typeof registerSchema>;
