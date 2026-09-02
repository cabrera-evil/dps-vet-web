import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { ContactStatus } from '@/constants/enum';
import type { Contact } from './contact.schema';

const COLLECTION = 'contacts';

/**
 * Firestore-backed repository for the `contacts` collection. Inherits the full
 * CRUD surface from {@link FirestoreRepository}; only collection-specific reads
 * are added here.
 */
export class ContactRepository extends FirestoreRepository<Contact> {
	constructor() {
		super(COLLECTION);
	}

	findByStatus(status: ContactStatus) {
		return this.findMany({
			where: [{ field: 'status', op: '==', value: status }],
			orderBy: [{ field: 'createdAt', direction: 'desc' }],
		});
	}
}
