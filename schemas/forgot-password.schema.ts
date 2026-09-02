import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(5, { message: 'Identifier must be at least 5 characters' })
		.max(50, { message: 'Identifier must not exceed 50 characters' })
		.email({ message: 'Invalid email address' }),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
