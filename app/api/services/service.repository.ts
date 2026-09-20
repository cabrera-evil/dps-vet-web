import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { Service } from './service.schema';

const COLLECTION = 'services';

/**
 * Firestore-backed repository for the `services` collection. Inherits the
 * full CRUD surface from {@link FirestoreRepository}; `findById` is also how
 * Phase 5 (appointments) resolves `durationMinutes` for slot-length
 * computation.
 */
export class ServiceRepository extends FirestoreRepository<Service> {
	constructor() {
		super(COLLECTION);
	}
}
