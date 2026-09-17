import { RoleRepository } from '@/app/api/_shared/repository/role.repository';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

/**
 * Composition root for the users module — the only place concrete classes
 * are wired together. Route handlers import the ready `userController`.
 */
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const service = new UserService(userRepository, roleRepository);

export const userController = new UserController(service);
