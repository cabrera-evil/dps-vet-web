import { z } from 'zod';

export const serviceSchema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().max(2000),
	durationMinutes: z.number().int().positive().max(1440),
	price: z.number().nonnegative(),
	category: z.string().min(1).max(60),
	active: z.boolean(),
	createdAt: z.string(),
});

/** Admin create payload — `createdAt` is set server-side; `active` defaults to true. */
export const createServiceSchema = serviceSchema
	.omit({ createdAt: true, active: true })
	.extend({ active: z.boolean().default(true) });

export const updateServiceSchema = serviceSchema
	.omit({ createdAt: true })
	.partial()
	.refine((input) => Object.keys(input).length > 0, {
		message: 'At least one field is required',
	});

/**
 * `z.coerce.boolean()` would map `'false'` to `true` (`Boolean('false')` is
 * truthy) — query params are always strings, so only `'true'`/`'false'` are
 * accepted and mapped explicitly.
 */
const booleanQueryParam = z
	.enum(['true', 'false'])
	.optional()
	.transform((value) => (value === undefined ? undefined : value === 'true'));

export const listServicesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	category: z.string().optional(),
	active: booleanQueryParam,
});

export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
