import { z } from 'zod';

export const googleSignInSchema = z.object({
	idToken: z.string().min(1).max(8192),
});

export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;
