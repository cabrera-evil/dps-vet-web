import { z } from 'zod';

export const tokenSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(128),
});

export type TokenInput = z.infer<typeof tokenSchema>;
