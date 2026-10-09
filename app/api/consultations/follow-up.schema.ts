import { FollowUpStatus } from '@/constants/enum';
import { z } from 'zod';

export const followUpSchema = z.object({
	petId: z.string().min(1),
	sourceEncounterId: z.string().min(1),
	recommendedDate: z.string(),
	reason: z.string().min(1).max(300),
	status: z.nativeEnum(FollowUpStatus),
	createdAt: z.string(),
	createdBy: z.string(),
});

export type FollowUp = z.infer<typeof followUpSchema>;
