import { CatalogController } from '@/app/api/_shared/catalog/catalog.controller';
import { CatalogRepository } from '@/app/api/_shared/catalog/catalog.repository';
import { CatalogService } from '@/app/api/_shared/catalog/catalog.service';

const repository = new CatalogRepository('diagnosis-catalog');
const service = new CatalogService(repository);

export const diagnosisCatalogController = new CatalogController(service);
