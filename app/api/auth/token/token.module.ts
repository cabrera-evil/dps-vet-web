import { TokenController } from './token.controller';
import { TokenService } from './token.service';

/** Composition root for the token module. */
export const tokenService = new TokenService();

export const tokenController = new TokenController(tokenService);
