import { z } from 'zod';

export const resetPasswordSchema = z.object({
	oobCode: z.string().min(1),
	password: z.string().min(8).max(128),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
