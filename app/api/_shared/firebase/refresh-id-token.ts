import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import type { FirebaseSignInTokens } from './sign-in-with-password-tokens';

const SECURE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';

interface SecureTokenResponse {
	id_token?: string;
	refresh_token?: string;
	expires_in?: string;
	error?: { code?: number; message?: string };
}

/**
 * Exchanges a Firebase refresh token for a new ID token via the Secure Token
 * REST API. Firebase may rotate the refresh token, so callers must use the
 * returned one. Never logs inputs or outputs.
 */
export async function refreshIdToken(
	refreshToken: string
): Promise<FirebaseSignInTokens> {
	const response = await fetch(
		`${SECURE_TOKEN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
		}
	);

	const body = (await response.json()) as SecureTokenResponse;

	if (
		!response.ok ||
		!body.id_token ||
		!body.refresh_token ||
		!Number.isFinite(Number(body.expires_in))
	) {
		const code = body.error?.message?.split(' : ')[0] ?? 'unknown';
		throw mapFirebaseError({ code, message: code });
	}

	return {
		idToken: body.id_token,
		refreshToken: body.refresh_token,
		expiresIn: Number(body.expires_in),
	};
}
