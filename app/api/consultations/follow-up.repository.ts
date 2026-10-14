import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { FollowUp } from './follow-up.schema';

export const FOLLOW_UPS_COLLECTION = 'follow-ups';

/**
 * Firestore-backed repository for the `follow-ups` collection. Pending
 * follow-ups are created when a consultation that requests one is finalized
 * (see `ConsultationRepository.finalizeDraft`).
 */
export class FollowUpRepository extends FirestoreRepository<FollowUp> {
	constructor() {
		super(FOLLOW_UPS_COLLECTION);
	}
}
