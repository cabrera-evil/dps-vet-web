import { ForgotPasswordController } from './forgot-password.controller';
import { ForgotPasswordService } from './forgot-password.service';

/** Composition root for the forgot-password module. */
export const forgotPasswordService = new ForgotPasswordService();

export const forgotPasswordController = new ForgotPasswordController(
	forgotPasswordService
);
