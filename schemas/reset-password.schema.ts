import { z } from 'zod';

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' })
			.max(50, { message: 'Password must not exceed 50 characters' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters' })
			.max(50, { message: 'Password must not exceed 50 characters' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
