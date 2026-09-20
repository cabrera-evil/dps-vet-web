import { confirmPasswordReset } from '@/app/api/_shared/firebase/confirm-password-reset';
import type { ResetPasswordInput } from './reset-password.schema';

/** Confirms a Firebase password reset for a previously issued `oobCode`. */
export class ResetPasswordService {
	async reset(input: ResetPasswordInput): Promise<void> {
		await confirmPasswordReset(input.oobCode, input.password);
	}
}
