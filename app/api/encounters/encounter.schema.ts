import {
	ClinicalEncounterType,
	ConsultationKind,
	ConsultationStatus,
} from '@/constants/enum';
import { z } from 'zod';

/**
 * Listing record for any clinical attention. Phase 1 only has consultations;
 * `kind`, `reason`, `mainDiagnosis` and `requiresFollowUp` are copied from the
 * consultation content so the patient's history can be listed without reading
 * every consultation document.
 */
export const encounterSchema = z.object({
	petId: z.string().min(1),
	type: z.nativeEnum(ClinicalEncounterType),
	status: z.nativeEnum(ConsultationStatus),
	staffId: z.string().min(1),
	staffName: z.string().min(1),
	appointmentId: z.string().min(1).optional(),
	occurredAt: z.string(),
	kind: z.nativeEnum(ConsultationKind).optional(),
	reason: z.string().max(500).optional(),
	mainDiagnosis: z.string().optional(),
	requiresFollowUp: z.boolean(),
	createdAt: z.string(),
	createdBy: z.string(),
	updatedAt: z.string(),
	updatedBy: z.string(),
	finalizedAt: z.string().optional(),
	finalizedBy: z.string().optional(),
});

export const listEncountersQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.nativeEnum(ConsultationStatus).optional(),
});

export type ClinicalEncounter = z.infer<typeof encounterSchema>;
export type ListEncountersQuery = z.infer<typeof listEncountersQuerySchema>;
