import { googleService } from '@/app/api/auth/google/google.module';
import { loginService } from '@/app/api/auth/login/login.module';
import NextAuth from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const nextAuth = NextAuth({
	debug:
		process.env.AUTH_DEBUG === 'true' && process.env.NODE_ENV !== 'production',
	trustHost: true,
	session: { strategy: 'jwt' },
	providers: [
		// Reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET. Never enable
		// allowDangerousEmailAccountLinking: googleService.issue owns account linking.
		Google,
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const email = credentials?.email;
				const password = credentials?.password;
				if (typeof email !== 'string' || typeof password !== 'string')
					return null;
				try {
					const identity = await loginService.login({ email, password });
					return {
						id: identity.uid,
						uid: identity.uid,
						name: identity.name ?? identity.email ?? identity.uid,
						email: identity.email,
						image: identity.picture,
					};
				} catch {
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, account }) {
			if (account?.provider === 'google') {
				// First Google sign-in only (later calls have no `account`). Throwing
				// here aborts the callback before any session cookie is written.
				if (!account.id_token) throw new Error('Missing Google id_token');
				const { identity } = await googleService.issue({
					idToken: account.id_token,
				});
				// proxy.ts authenticates by token.sub, so it must be the Firebase uid
				// (not the Google account id). The Firebase tokens are not kept.
				token.sub = identity.uid;
				token.uid = identity.uid;
				token.name = identity.name ?? identity.email ?? identity.uid;
				token.email = identity.email;
				token.picture = identity.picture;
			} else if (user?.uid) token.uid = user.uid;
			// Drop any permissions claim left in legacy cookies.
			delete (token as Record<string, unknown>).permissions;
			return token;
		},
		session({ session, token }) {
			if (token?.uid) session.user.uid = token.uid;
			return session;
		},
	},
	pages: {
		signIn: '/auth/login',
		error: '/auth/login',
	},
	experimental: { enableWebAuthn: true },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
