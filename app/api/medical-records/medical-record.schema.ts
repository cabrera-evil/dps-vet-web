import { z } from 'zod';

export const medicalRecordSchema = z.object({
	petId: z.string().min(1),
	staffId: z.string().min(1),
	date: z.string(),
	diagnosis: z.string().min(1).max(2000),
	treatment: z.string().min(1).max(2000),
	notes: z.string().max(2000).optional(),
	attachmentPaths: z.array(z.string()).default([]),
});

/** Staff create payload — `staffId`/`attachmentPaths` are set server-side. */
export const createMedicalRecordSchema = medicalRecordSchema.omit({
	staffId: true,
	attachmentPaths: true,
});

export const updateMedicalRecordSchema = medicalRecordSchema
	.omit({ petId: true, staffId: true, attachmentPaths: true })
	.partial()
	.refine((input) => Object.keys(input).length > 0, {
		message: 'At least one field is required',
	});

export const requestAttachmentUploadSchema = z.object({
	fileName: z.string().min(1).max(200),
	contentType: z.string().min(1).max(100),
});

export const listMedicalRecordsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	petId: z.string().optional(),
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;
export type CreateMedicalRecordInput = z.infer<
	typeof createMedicalRecordSchema
>;
export type UpdateMedicalRecordInput = z.infer<
	typeof updateMedicalRecordSchema
>;
export type RequestAttachmentUploadInput = z.infer<
	typeof requestAttachmentUploadSchema
>;
export type ListMedicalRecordsQuery = z.infer<
	typeof listMedicalRecordsQuerySchema
>;
