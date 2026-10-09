import { z } from 'zod';

/** A breed belongs to exactly one species; species without breeds simply have none. */
export const breedSchema = z.object({
	name: z.string().min(1).max(80),
	species: z.string().min(1).max(60),
});

export const listBreedsQuerySchema = z.object({
	species: z.string().min(1).optional(),
});

export type Breed = z.infer<typeof breedSchema>;
export type ListBreedsQuery = z.infer<typeof listBreedsQuerySchema>;
