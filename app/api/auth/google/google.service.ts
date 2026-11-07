import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { auth } from '@/app/api/_shared/firebase';
import { getGoogleOAuthClientIds } from '@/app/api/_shared/firebase/config';
import { revokeRefreshTokens } from '@/app/api/_shared/firebase/revoke-refresh-tokens';
import { signInWithGoogleIdToken } from '@/app/api/_shared/firebase/sign-in-with-idp-tokens';
import { verifyFirebaseIdToken } from '@/app/api/_shared/firebase/verify-id-token';
import type { TokenResult } from '@/app/api/auth/token/token.service';
import type { UserService } from '@/app/api/users/user.service';
import createHttpError, { HttpError } from 'http-errors';
import type { GoogleSignInInput } from './google.schema';

const INVALID_TOKEN = 'Invalid Google token';

/**
 * Reads `aud` / `email_verified` from the token payload WITHOUT verifying it.
 * Only used to reject early (allowlist + unverified email) before calling
 * Identity Toolkit; Firebase performs the real signature/issuer/expiry check
 * and the result is re-checked against its verified response.
 */
function readUnverifiedClaims(token: string): {
	aud?: unknown;
	email?: unknown;
	email_verified?: unknown;
} {
	let claims: unknown;
	try {
		const payload = token.split('.')[1] ?? '';
		claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
	} catch {
		throw new createHttpError.Unauthorized(INVALID_TOKEN);
	}
	// null, strings, numbers and arrays are valid JSON but not a claims object.
	if (typeof claims !== 'object' || claims === null || Array.isArray(claims))
		throw new createHttpError.Unauthorized(INVALID_TOKEN);
	return claims;
}

/**
 * Uid of an existing Auth user with this email that is not yet linked to
 * Google, or null. Only decides whether to revoke; the email comes from the
 * unverified payload, which Firebase re-verifies in the exchange.
 */
async function findUnlinkedUid(email: unknown): Promise<string | null> {
	if (typeof email !== 'string') return null;
	try {
		const user = await auth().getUserByEmail(email);
		return user.providerData.some((p) => p.providerId === 'google.com')
			? null
			: user.uid;
	} catch (error) {
		const mapped = mapFirebaseError(error);
		if ((mapped as HttpError).code === 'auth/user-not-found') return null;
		throw mapped; // fail closed: skipping the check could skip the revocation
	}
}

// Refresh-token revocation has one-second granularity.
const REVOCATION_SETTLE_MS = 1100;

/** Exchanges a Google ID token for Firebase tokens, provisioning the profile. */
export class GoogleService {
	constructor(private readonly users: UserService) {}

	async issue(input: GoogleSignInInput): Promise<TokenResult> {
		const claims = readUnverifiedClaims(input.idToken);
		if (
			typeof claims.aud !== 'string' ||
			!getGoogleOAuthClientIds().includes(claims.aud)
		)
			throw new createHttpError.Unauthorized(INVALID_TOKEN);
		// Google sends a boolean, but tolerate the string form some issuers use.
		if (claims.email_verified !== true && claims.email_verified !== 'true')
			throw new createHttpError.Unauthorized('Google email is not verified');

		try {
			const unlinkedUid = await findUnlinkedUid(claims.email);
			let signIn = await signInWithGoogleIdToken(input.idToken);
			if (!signIn.emailVerified || !signIn.email)
				throw new createHttpError.Unauthorized('Google email is not verified');
			const email = signIn.email;

			// First link of a pre-existing password account (pre-hijack defense:
			// POST /users is public and unverified, so an attacker may hold its
			// refresh tokens). Revoke them, then re-exchange for a pair issued after
			// the revocation. Runs before provisioning so a retry cannot skip it.
			// ponytail: kills old sessions only; the original password still works,
			// and a failure after the link (revoke error) is not retried because the
			// account then counts as linked. Add email verification on POST /users.
			if (unlinkedUid && unlinkedUid === signIn.uid) {
				await revokeRefreshTokens(signIn.uid);
				await new Promise((resolve) =>
					setTimeout(resolve, REVOCATION_SETTLE_MS)
				);
				signIn = await signInWithGoogleIdToken(input.idToken);
			}

			await this.users.provisionGoogleUser(signIn.uid, {
				email,
				name: signIn.displayName,
			});

			return {
				idToken: signIn.idToken,
				refreshToken: signIn.refreshToken,
				expiresIn: signIn.expiresIn,
				identity: await verifyFirebaseIdToken(signIn.idToken),
			};
		} catch (error) {
			const code = (error as HttpError).code;
			if (code === 'INVALID_IDP_RESPONSE' || code === 'USER_DISABLED')
				throw new createHttpError.Unauthorized(INVALID_TOKEN);
			if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER')
				throw new createHttpError.TooManyRequests(
					'Too many attempts, try again later'
				);
			throw error;
		}
	}
}
