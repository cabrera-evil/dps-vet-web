import { BreedRepository } from '@/app/api/breeds/breed.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { PetController } from './pet.controller';
import { PetRepository } from './pet.repository';
import { PetService } from './pet.service';

/**
 * Composition root for the pets module — the only place concrete classes
 * are wired together. Route handlers import the ready `petController`.
 * Reads the `breeds` catalog read-only (ISP) to validate a pet's breed, and
 * `users` read-only to validate the owner chosen by staff.
 */
const repository = new PetRepository();
const breedRepository = new BreedRepository();
const userRepository = new UserRepository();
const service = new PetService(repository, breedRepository, userRepository);

export const petController = new PetController(service);
