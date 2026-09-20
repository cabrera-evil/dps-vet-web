import { ResetPasswordController } from './reset-password.controller';
import { ResetPasswordService } from './reset-password.service';

/** Composition root for the reset-password module. */
export const resetPasswordService = new ResetPasswordService();

export const resetPasswordController = new ResetPasswordController(
	resetPasswordService
);
