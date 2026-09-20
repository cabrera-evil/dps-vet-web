import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';

const IDENTITY_TOOLKIT_OOB_CODE_URL =
	'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode';

interface IdentityToolkitOobCodeResponse {
	email?: string;
	error?: { code?: number; message?: string };
}

/**
 * Requests a password-reset email via the Identity Toolkit REST API — the
 * server-side equivalent of the Firebase client SDK's
 * `sendPasswordResetEmail`, since `firebase-admin` has no such call.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
	const response = await fetch(
		`${IDENTITY_TOOLKIT_OOB_CODE_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
		}
	);

	if (response.ok) return;

	const body = (await response.json()) as IdentityToolkitOobCodeResponse;
	const code = body.error?.message ?? 'unknown';
	throw mapFirebaseError({ code, message: code });
}
