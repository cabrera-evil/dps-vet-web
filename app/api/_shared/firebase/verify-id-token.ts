import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { Permission } from '@/constants/permission';
import { auth } from './index';

export interface FirebaseIdentity {
	uid: string;
	permissions: Permission[];
	email?: string;
	name?: string;
	picture?: string;
}

/**
 * Verifies a Firebase ID token (from the NextAuth credentials flow or an
 * `Authorization: Bearer` header) and extracts the identity shape used
 * throughout the app. `permissions` is read directly off the token's custom
 * claims — authorization is permission-based only; there is no separate
 * `role` concept in application code. Roles (as named groups of permissions)
 * are administered in Firestore, not this codebase.
 */
export async function verifyFirebaseIdToken(
	idToken: string
): Promise<FirebaseIdentity> {
	try {
		const decoded = await auth().verifyIdToken(idToken);
		return {
			uid: decoded.uid,
			permissions: (decoded.permissions as Permission[] | undefined) ?? [],
			email: decoded.email,
			name: decoded.name,
			picture: decoded.picture,
		};
	} catch (error) {
		throw mapFirebaseError(error);
	}
}
