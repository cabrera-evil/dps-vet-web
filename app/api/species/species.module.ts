import { CatalogController } from '@/app/api/_shared/catalog/catalog.controller';
import { CatalogRepository } from '@/app/api/_shared/catalog/catalog.repository';
import { CatalogService } from '@/app/api/_shared/catalog/catalog.service';

const repository = new CatalogRepository('species');
const service = new CatalogService(repository);

export const speciesController = new CatalogController(service);
