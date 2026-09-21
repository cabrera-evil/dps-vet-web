import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { CatalogRepository } from './catalog.repository';
import type { CatalogEntry } from './catalog.schema';

export class CatalogService {
	constructor(private readonly repo: CatalogRepository) {}

	list(): Promise<WithId<CatalogEntry>[]> {
		return this.repo.list();
	}
}
