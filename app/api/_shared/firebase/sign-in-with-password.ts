import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';

const IDENTITY_TOOLKIT_SIGN_IN_URL =
	'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

interface IdentityToolkitSignInResponse {
	idToken?: string;
	error?: { code?: number; message?: string };
}

/**
 * Verifies an email/password pair against Firebase Auth via the Identity
 * Toolkit REST API. `firebase-admin` can only verify pre-issued ID tokens, not
 * passwords, so this is the server-side equivalent of the Firebase client
 * SDK's `signInWithEmailAndPassword` — a plain HTTP call using the project's
 * public Web API key, never the client SDK.
 */
export async function signInWithPassword(
	email: string,
	password: string
): Promise<{ idToken: string }> {
	const response = await fetch(
		`${IDENTITY_TOOLKIT_SIGN_IN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password, returnSecureToken: true }),
		}
	);

	const body = (await response.json()) as IdentityToolkitSignInResponse;

	if (!response.ok || !body.idToken) {
		const code = body.error?.message ?? 'unknown';
		throw mapFirebaseError({ code, message: code });
	}

	return { idToken: body.idToken };
}
