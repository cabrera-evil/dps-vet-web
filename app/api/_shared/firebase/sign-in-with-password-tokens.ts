import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';

const IDENTITY_TOOLKIT_SIGN_IN_URL =
	'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

interface IdentityToolkitSignInResponse {
	idToken?: string;
	refreshToken?: string;
	expiresIn?: string;
	error?: { code?: number; message?: string };
}

export interface FirebaseSignInTokens {
	idToken: string;
	refreshToken: string;
	/** Seconds until `idToken` expires. */
	expiresIn: number;
}

/**
 * Same Identity Toolkit call as `signInWithPassword`, but returns the full
 * token set (for native clients that cannot use a cookie session). Kept in
 * its own file so the web login helper stays untouched. Never logs inputs or
 * outputs.
 */
export async function signInWithPasswordTokens(
	email: string,
	password: string
): Promise<FirebaseSignInTokens> {
	const response = await fetch(
		`${IDENTITY_TOOLKIT_SIGN_IN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password, returnSecureToken: true }),
		}
	);

	const body = (await response.json()) as IdentityToolkitSignInResponse;

	if (
		!response.ok ||
		!body.idToken ||
		!body.refreshToken ||
		!Number.isFinite(Number(body.expiresIn))
	) {
		// Firebase appends details after " : " (e.g. TOO_MANY_ATTEMPTS_TRY_LATER : ...).
		const code = body.error?.message?.split(' : ')[0] ?? 'unknown';
		throw mapFirebaseError({ code, message: code });
	}

	return {
		idToken: body.idToken,
		refreshToken: body.refreshToken,
		expiresIn: Number(body.expiresIn),
	};
}
