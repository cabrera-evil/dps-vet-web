import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import createHttpError from 'http-errors';
import { getFirebaseWebApiKey } from './config';
import type { FirebaseSignInTokens } from './sign-in-with-password-tokens';

const UPSTREAM_TIMEOUT_MS = 10_000;

const IDENTITY_TOOLKIT_SIGN_IN_IDP_URL =
	'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp';

interface IdentityToolkitSignInIdpResponse {
	idToken?: string;
	refreshToken?: string;
	expiresIn?: string;
	localId?: string;
	email?: string;
	emailVerified?: boolean;
	displayName?: string;
	error?: { code?: number; message?: string };
}

export interface FirebaseIdpSignIn extends FirebaseSignInTokens {
	uid: string;
	email?: string;
	emailVerified: boolean;
	displayName?: string;
}

/**
 * Exchanges a Google ID token for Firebase tokens through Identity Toolkit
 * `signInWithIdp`; Firebase verifies the token signature, issuer, expiry and
 * links/creates the Auth user. Never logs inputs or outputs.
 */
export async function signInWithGoogleIdToken(
	googleIdToken: string
): Promise<FirebaseIdpSignIn> {
	// Resolved outside the try so a missing key stays a controlled 500, not a 502.
	const apiKey = getFirebaseWebApiKey();
	let response: Response;
	let body: IdentityToolkitSignInIdpResponse;
	try {
		response = await fetch(
			`${IDENTITY_TOOLKIT_SIGN_IN_IDP_URL}?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postBody: new URLSearchParams({
						id_token: googleIdToken,
						providerId: 'google.com',
					}).toString(),
					requestUri: 'http://localhost',
					returnIdpCredential: true,
					returnSecureToken: true,
				}),
				signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
			}
		);
		body = ((await response.json()) ?? {}) as IdentityToolkitSignInIdpResponse;
	} catch (error) {
		// Never include the URL (it carries the API key) or the cause in the message.
		const timedOut = (error as Error).name === 'TimeoutError';
		throw timedOut
			? new createHttpError.GatewayTimeout('Identity provider timed out')
			: new createHttpError.BadGateway('Identity provider unavailable');
	}

	if (
		!response.ok ||
		!body.idToken ||
		!body.refreshToken ||
		!body.localId ||
		!Number.isFinite(Number(body.expiresIn))
	) {
		// Firebase appends details after " : " (e.g. INVALID_IDP_RESPONSE : ...).
		const code = body.error?.message?.split(' : ')[0] ?? 'unknown';
		throw mapFirebaseError({ code, message: code });
	}

	return {
		idToken: body.idToken,
		refreshToken: body.refreshToken,
		expiresIn: Number(body.expiresIn),
		uid: body.localId,
		email: body.email,
		emailVerified: body.emailVerified === true,
		displayName: body.displayName,
	};
}
