import { z } from 'zod';

export const catalogEntrySchema = z.object({
	name: z.string().min(1).max(80),
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;
