import { refreshIdToken } from '@/app/api/_shared/firebase/refresh-id-token';
import {
	FirebaseIdentity,
	verifyFirebaseIdToken,
} from '@/app/api/_shared/firebase/verify-id-token';
import createHttpError, { HttpError } from 'http-errors';
import type { RefreshInput } from './refresh.schema';

export interface RefreshResult {
	idToken: string;
	refreshToken: string;
	expiresIn: number;
	identity: FirebaseIdentity;
}

// Invalid, expired, revoked (Firebase reports TOKEN_EXPIRED), and
// disabled/deleted-user tokens all collapse to one generic 401.
const INVALID_TOKEN_CODES = new Set([
	'TOKEN_EXPIRED',
	'INVALID_REFRESH_TOKEN',
	'USER_DISABLED',
	'USER_NOT_FOUND',
	'MISSING_REFRESH_TOKEN',
]);

/** Exchanges a Firebase refresh token for a fresh ID token. */
export class RefreshService {
	async refresh(input: RefreshInput): Promise<RefreshResult> {
		try {
			const tokens = await refreshIdToken(input.refreshToken);
			return {
				...tokens,
				identity: await verifyFirebaseIdToken(tokens.idToken),
			};
		} catch (error) {
			const code = (error as HttpError).code;
			if (INVALID_TOKEN_CODES.has(code))
				throw new createHttpError.Unauthorized('Invalid refresh token');
			if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER')
				throw new createHttpError.TooManyRequests(
					'Too many attempts, try again later'
				);
			throw error;
		}
	}
}
