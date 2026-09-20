import { z } from 'zod';

export const userSchema = z.object({
	uid: z.string().min(1),
	name: z.string().min(1).max(120),
	email: z.string().email(),
	phone: z.string().min(1).max(30),
	role: z.string().min(1).max(50),
	createdAt: z.string(),
});

/** Public registration payload — uid/role/createdAt are set server-side. */
export const createUserSchema = z.object({
	name: z.string().min(1).max(120),
	email: z.string().email(),
	phone: z.string().min(1).max(30),
	password: z.string().min(8).max(128),
});

/** Admin role change. */
export const updateUserRoleSchema = userSchema.pick({ role: true });

export const listUsersQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	role: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
