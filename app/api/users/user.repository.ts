import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { User } from './user.schema';

const COLLECTION = 'users';

/**
 * Firestore-backed repository for the `users` collection. Documents are
 * keyed by Firebase `uid` (passed explicitly to `create`), so `findById`
 * doubles as "find by auth identity". No collection-specific queries are
 * needed yet beyond the inherited CRUD surface.
 */
export class UserRepository extends FirestoreRepository<User> {
	constructor() {
		super(COLLECTION);
	}
}
