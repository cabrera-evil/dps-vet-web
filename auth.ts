import { verifyFirebaseIdToken } from '@/app/api/_shared/firebase/verify-id-token';
import NextAuth from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

const nextAuth = NextAuth({
	debug: process.env.AUTH_DEBUG,
	trustHost: true,
	session: { strategy: 'jwt' },
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				idToken: { label: 'Firebase ID Token', type: 'text' },
			},
			async authorize(credentials) {
				const idToken = credentials?.idToken;
				if (typeof idToken !== 'string' || !idToken) return null;
				try {
					const identity = await verifyFirebaseIdToken(idToken);
					return {
						id: identity.uid,
						uid: identity.uid,
						name: identity.name ?? identity.email ?? identity.uid,
						email: identity.email,
						image: identity.picture,
						permissions: identity.permissions,
					};
				} catch {
					return null;
				}
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user?.uid) token.uid = user.uid;
			if (user?.permissions) token.permissions = user.permissions;
			return token;
		},
		session({ session, token }) {
			if (token?.uid) session.user.uid = token.uid;
			if (token?.permissions) session.user.permissions = token.permissions;
			return session;
		},
	},
	pages: {
		signIn: '/auth/login',
	},
	experimental: { enableWebAuthn: true },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
