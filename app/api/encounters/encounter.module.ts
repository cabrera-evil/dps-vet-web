import { PetRepository } from '@/app/api/pets/pet.repository';
import { EncounterController } from './encounter.controller';
import { EncounterRepository } from './encounter.repository';
import { EncounterService } from './encounter.service';

/**
 * Composition root for the encounters module — the only place concrete
 * classes are wired together. Route handlers import the ready
 * `encounterController`.
 */
const encounterRepository = new EncounterRepository();
const petRepository = new PetRepository();
const service = new EncounterService(encounterRepository, petRepository);

export const encounterController = new EncounterController(service);
