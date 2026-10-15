import { revokeRefreshTokens } from '@/app/api/_shared/firebase/revoke-refresh-tokens';
import type { Identity } from '@/app/api/_shared/http/http.types';

/**
 * Revokes the caller's Firebase refresh tokens. The uid comes only from the
 * identity resolved by `withAuth`, never from the request. NextAuth web
 * sessions are separate cookies and are not touched.
 */
export class LogoutService {
	async logout(identity: Identity): Promise<void> {
		await revokeRefreshTokens(identity.uid);
	}
}
