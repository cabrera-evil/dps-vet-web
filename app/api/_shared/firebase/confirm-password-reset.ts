import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';

const IDENTITY_TOOLKIT_RESET_PASSWORD_URL =
	'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword';

interface IdentityToolkitResetPasswordResponse {
	email?: string;
	error?: { code?: number; message?: string };
}

/**
 * Confirms a password reset via the Identity Toolkit REST API using the
 * `oobCode` issued by {@link sendPasswordResetEmail}'s reset link — the
 * server-side equivalent of the Firebase client SDK's `confirmPasswordReset`,
 * since `firebase-admin` has no such call.
 */
export async function confirmPasswordReset(
	oobCode: string,
	newPassword: string
): Promise<void> {
	const response = await fetch(
		`${IDENTITY_TOOLKIT_RESET_PASSWORD_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ oobCode, newPassword }),
		}
	);

	if (response.ok) return;

	const body = (await response.json()) as IdentityToolkitResetPasswordResponse;
	const code = body.error?.message ?? 'unknown';
	throw mapFirebaseError({ code, message: code });
}
