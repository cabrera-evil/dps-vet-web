import { z } from 'zod';
import { consultationDiagnosisSchema } from './consultation.schema';

/** A finalized consultation's diagnosis, kept as its own row to query active problems. */
export const diagnosisSchema = consultationDiagnosisSchema.extend({
	petId: z.string().min(1),
	encounterId: z.string().min(1),
	occurredAt: z.string(),
	position: z.number().int().nonnegative(),
	createdAt: z.string(),
	createdBy: z.string(),
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;
