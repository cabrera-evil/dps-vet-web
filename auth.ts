import { loginService } from '@/app/api/auth/login/login.module';
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
