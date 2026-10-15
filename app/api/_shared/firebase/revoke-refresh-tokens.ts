import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { auth } from './index';

/**
 * Revokes every refresh token of `uid`, so no new ID token can be minted from
 * them. Already-issued ID tokens stay valid until they expire.
 */
export async function revokeRefreshTokens(uid: string): Promise<void> {
	try {
		await auth().revokeRefreshTokens(uid);
	} catch (error) {
		throw mapFirebaseError(error);
	}
}
