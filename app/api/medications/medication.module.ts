import { MedicationController } from './medication.controller';
import { MedicationRepository } from './medication.repository';
import { MedicationCatalogService } from './medication.service';

/**
 * Composition root for the medications module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `medicationController`.
 */
const repository = new MedicationRepository();
const service = new MedicationCatalogService(repository);

export const medicationController = new MedicationController(service);
