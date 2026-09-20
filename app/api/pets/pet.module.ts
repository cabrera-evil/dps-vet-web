import { PetController } from './pet.controller';
import { PetRepository } from './pet.repository';
import { PetService } from './pet.service';

/**
 * Composition root for the pets module — the only place concrete classes
 * are wired together. Route handlers import the ready `petController`.
 */
const repository = new PetRepository();
const service = new PetService(repository);

export const petController = new PetController(service);
