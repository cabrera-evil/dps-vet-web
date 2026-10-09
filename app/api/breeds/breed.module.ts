import { BreedController } from './breed.controller';
import { BreedRepository } from './breed.repository';
import { BreedService } from './breed.service';

const breedRepository = new BreedRepository();
const service = new BreedService(breedRepository);

export const breedController = new BreedController(service);
