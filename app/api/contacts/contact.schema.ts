import { ContactStatus } from '@/constants/enum';
import { z } from 'zod';

export const contactSchema = z.object({
	name: z.string().min(1).max(120),
	email: z.string().email(),
	subject: z.string().min(1).max(200),
	message: z.string().min(1).max(5000),
	status: z.nativeEnum(ContactStatus),
	createdAt: z.string(),
});

/** Public contact-form payload — status and timestamp are set server-side. */
export const createContactSchema = contactSchema.omit({
	status: true,
	createdAt: true,
});

/** Admin status transition. */
export const updateContactSchema = contactSchema.pick({ status: true });

export const listContactsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.nativeEnum(ContactStatus).optional(),
});

export type Contact = z.infer<typeof contactSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
