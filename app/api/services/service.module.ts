import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { ServiceCatalogService } from './service.service';

/**
 * Composition root for the services module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `serviceController`.
 */
const repository = new ServiceRepository();
const service = new ServiceCatalogService(repository);

export const serviceController = new ServiceController(service);
