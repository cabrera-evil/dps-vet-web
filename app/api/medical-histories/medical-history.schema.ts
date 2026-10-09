import {
	ClinicalAlertType,
	MedicalHistoryStatus,
	MedicalHistoryType,
} from '@/constants/enum';
import { z } from 'zod';

const approximateDateSchema = z
	.string()
	.refine((value) => !Number.isNaN(Date.parse(value)), {
		message: 'Invalid date',
	})
	.refine((value) => Date.parse(value) <= Date.now(), {
		message: 'Date cannot be in the future',
	});

const editableFields = {
	type: z.nativeEnum(MedicalHistoryType),
	name: z.string().trim().min(2).max(120),
	approximateDate: approximateDateSchema.optional(),
	status: z.nativeEnum(MedicalHistoryStatus),
	description: z.string().max(2000).optional(),
	isAlert: z.boolean(),
	alertType: z.nativeEnum(ClinicalAlertType).optional(),
};

export const medicalHistorySchema = z.object({
	petId: z.string().min(1),
	...editableFields,
	archived: z.boolean(),
	archivedAt: z.string().optional(),
	archivedBy: z.string().optional(),
	createdAt: z.string(),
	createdBy: z.string(),
	updatedAt: z.string(),
	updatedBy: z.string(),
});

/** Staff create payload — `petId` comes from the route; audit and archive fields are set server-side. */
export const createMedicalHistorySchema = z
	.object({ ...editableFields, isAlert: z.boolean().default(false) })
	.refine((input) => !input.isAlert || !!input.alertType, {
		message: 'alertType is required when isAlert is true',
		path: ['alertType'],
	});

/** `null` clears an optional field; omitted fields are left untouched. */
export const updateMedicalHistorySchema = z
	.object({
		...editableFields,
		approximateDate: approximateDateSchema.nullable().optional(),
		description: z.string().max(2000).nullable().optional(),
	})
	.partial()
	.refine((input) => Object.keys(input).length > 0, {
		message: 'At least one field is required',
	});

export const listMedicalHistoriesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type MedicalHistory = z.infer<typeof medicalHistorySchema>;
export type CreateMedicalHistoryInput = z.infer<
	typeof createMedicalHistorySchema
>;
export type UpdateMedicalHistoryInput = z.infer<
	typeof updateMedicalHistorySchema
>;
export type ListMedicalHistoriesQuery = z.infer<
	typeof listMedicalHistoriesQuerySchema
>;
