import { z } from 'zod';

export const userSchema = z.object({
	id: z.number().optional(),
	firstName: z.string(),
	lastName: z.string(),
	username: z.string(),
	email: z.string().email(),
	role: z.string(),
	password: z.string(),
	provider: z.string(),
	emailVerified: z.boolean().optional(),
	emailVerifiedAt: z.string().nullable().optional(),
	profileCompleted: z.boolean().optional(),
	lastLoginAt: z.string().nullable().optional(),
	resetToken: z.any().nullable().optional(),
	picture: z.any().nullable().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
