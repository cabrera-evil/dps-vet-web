import { FirestoreRepository } from './firestore.repository';
import type { RoleDocument } from './role.types';

const COLLECTION = 'roles';

/**
 * Read access to the `roles` catalog collection (seeded via
 * `scripts/seed/catalog/role.catalog.ts`). A role's document id is its name;
 * its `permissions` field is what gets flattened onto a user's Firebase
 * custom claim at registration or role change — there is no role→permission
 * table in application code, only this lookup.
 */
export class RoleRepository extends FirestoreRepository<RoleDocument> {
	constructor() {
		super(COLLECTION);
	}
}
