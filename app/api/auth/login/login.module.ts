import { LoginController } from './login.controller';
import { LoginService } from './login.service';

/**
 * Composition root for the login module. `loginService` is also imported
 * directly by `auth.ts`'s NextAuth `authorize()` callback — it runs
 * server-side in the same process, so it calls the service in-process rather
 * than looping back over HTTP to this module's own route.
 */
export const loginService = new LoginService();

export const loginController = new LoginController(loginService);
