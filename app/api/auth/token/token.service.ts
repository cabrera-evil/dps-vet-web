import { signInWithPasswordTokens } from '@/app/api/_shared/firebase/sign-in-with-password-tokens';
import {
	FirebaseIdentity,
	verifyFirebaseIdToken,
} from '@/app/api/_shared/firebase/verify-id-token';
import createHttpError, { HttpError } from 'http-errors';
import type { TokenInput } from './token.schema';

export interface TokenResult {
	idToken: string;
	refreshToken: string;
	expiresIn: number;
	identity: FirebaseIdentity;
}

// Every credential failure collapses to one response so the endpoint never
// reveals whether an email exists or is disabled.
const CREDENTIAL_FAILURE_CODES = new Set([
	'EMAIL_NOT_FOUND',
	'INVALID_PASSWORD',
	'INVALID_LOGIN_CREDENTIALS',
	'INVALID_EMAIL',
	'USER_DISABLED',
]);

/** Exchanges email/password for Firebase tokens plus the caller's identity. */
export class TokenService {
	async issue(input: TokenInput): Promise<TokenResult> {
		try {
			const tokens = await signInWithPasswordTokens(
				input.email,
				input.password
			);
			return {
				...tokens,
				identity: await verifyFirebaseIdToken(tokens.idToken),
			};
		} catch (error) {
			const code = (error as HttpError).code;
			if (CREDENTIAL_FAILURE_CODES.has(code))
				throw new createHttpError.Unauthorized('Invalid credentials');
			if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER')
				throw new createHttpError.TooManyRequests(
					'Too many attempts, try again later'
				);
			throw error;
		}
	}
}
