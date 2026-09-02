import { z } from 'zod';

export const loginSchema = z.object({
	identifier: z
		.string()
		.min(5, { message: 'Identifier must be at least 5 characters' })
		.max(50, { message: 'Identifier must not exceed 50 characters' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' })
		.max(50, { message: 'Password must not exceed 50 characters' }),
});

export type Login = z.infer<typeof loginSchema>;
