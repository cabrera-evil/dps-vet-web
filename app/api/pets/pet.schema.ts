import { weightKgSchema } from '@/app/api/consultations/clinical-measurement.schema';
import { PetSex } from '@/constants/enum';
import { z } from 'zod';

export const petSchema = z.object({
	ownerId: z.string().min(1),
	name: z.string().min(1).max(120),
	species: z.string().min(1).max(60),
	breed: z.string().min(1).max(60).optional(),
	birthDate: z.string(),
	notes: z.string().max(2000).optional(),
	sex: z.nativeEnum(PetSex).optional(),
	sterilized: z.boolean().optional(),
	color: z.string().max(60).optional(),
	markings: z.string().max(300).optional(),
	microchip: z.string().max(40).optional(),
	createdAt: z.string(),
});

/** Client payload — `ownerId`/`createdAt` are set server-side from the caller identity. */
const petInputSchema = petSchema.omit({
	ownerId: true,
	createdAt: true,
});

/**
 * `weightKg` is the optional weight taken at the front desk: it is not stored
 * on the pet but as the first entry of its weight history (staff only).
 */
export const createPetSchema = petInputSchema.extend({
	weightKg: weightKgSchema.optional(),
});

export const updatePetSchema = petInputSchema
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
