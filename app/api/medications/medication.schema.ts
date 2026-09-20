import { z } from 'zod';

export const medicationSchema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().max(2000),
	stock: z.number().int().nonnegative(),
	price: z.number().nonnegative(),
	active: z.boolean(),
});

/** Admin create payload — `active` defaults to true. */
export const createMedicationSchema = medicationSchema
	.omit({ active: true })
	.extend({ active: z.boolean().default(true) });

export const updateMedicationSchema = medicationSchema
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

export const listMedicationsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	active: booleanQueryParam,
});

export type Medication = z.infer<typeof medicationSchema>;
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type ListMedicationsQuery = z.infer<typeof listMedicationsQuerySchema>;
