import { userService } from '@/app/api/users/user.module';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

/** Composition root for the Google sign-in module. */
export const googleService = new GoogleService(userService);

export const googleController = new GoogleController(googleService);
