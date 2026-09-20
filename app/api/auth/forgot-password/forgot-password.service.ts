import { sendPasswordResetEmail } from '@/app/api/_shared/firebase/send-password-reset-email';
import { HttpError } from 'http-errors';

/**
 * Requests a Firebase password-reset email. An unknown email resolves
 * silently, identically to a known one, so this endpoint never reveals
 * whether an account exists for the given address.
 */
export class ForgotPasswordService {
	async requestReset(email: string): Promise<void> {
		try {
			await sendPasswordResetEmail(email);
		} catch (error) {
			if ((error as HttpError).code === 'EMAIL_NOT_FOUND') return;
			throw error;
		}
	}
}
