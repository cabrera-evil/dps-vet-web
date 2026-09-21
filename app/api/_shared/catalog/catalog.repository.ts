import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { CatalogEntry } from './catalog.schema';

/**
 * Generic read-oriented repository for small, seed-managed lookup
 * collections (species, breeds, ...). No create/update/delete surface is
 * exposed — these catalogs are administered via `scripts/seed`, not the API.
 */
export class CatalogRepository extends FirestoreRepository<CatalogEntry> {
	constructor(collectionPath: string) {
		super(collectionPath);
	}

	list() {
		return this.findMany({ orderBy: [{ field: 'name', direction: 'asc' }] });
	}
}
