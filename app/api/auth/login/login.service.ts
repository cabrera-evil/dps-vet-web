import { signInWithPassword } from '@/app/api/_shared/firebase/sign-in-with-password';
import {
	FirebaseIdentity,
	verifyFirebaseIdToken,
} from '@/app/api/_shared/firebase/verify-id-token';
import type { LoginInput } from './login.schema';

/** Verifies email/password against Firebase Auth and resolves the caller's identity. */
export class LoginService {
	async login(input: LoginInput): Promise<FirebaseIdentity> {
		const { idToken } = await signInWithPassword(input.email, input.password);
		return verifyFirebaseIdToken(idToken);
	}
}
