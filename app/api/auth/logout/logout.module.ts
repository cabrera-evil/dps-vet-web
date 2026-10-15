import { LogoutController } from './logout.controller';
import { LogoutService } from './logout.service';

/** Composition root for the logout module. */
export const logoutService = new LogoutService();

export const logoutController = new LogoutController(logoutService);
