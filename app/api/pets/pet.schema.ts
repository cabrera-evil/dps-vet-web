import { z } from 'zod';

export const petSchema = z.object({
	ownerId: z.string().min(1),
	name: z.string().min(1).max(120),
	species: z.string().min(1).max(60),
	breed: z.string().min(1).max(60),
	birthDate: z.string(),
	notes: z.string().max(2000).optional(),
	createdAt: z.string(),
});

/** Client payload — `ownerId`/`createdAt` are set server-side from the caller identity. */
export const createPetSchema = petSchema.omit({
	ownerId: true,
	createdAt: true,
});

export const updatePetSchema = createPetSchema
	.partial()
	.refine((input) => Object.keys(input).length > 0, {
		message: 'At least one field is required',
	});

export const listPetsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	ownerId: z.string().optional(),
});

export type Pet = z.infer<typeof petSchema>;
export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type ListPetsQuery = z.infer<typeof listPetsQuerySchema>;
