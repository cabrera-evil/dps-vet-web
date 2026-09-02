import { create } from '@/lib/rest';
import { add } from 'date-fns';
import NextAuth from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { User } from './schemas/user.schema';
import { getUserAvatar } from './utils/gravatar';

const nextAuth = NextAuth({
	debug: process.env.AUTH_DEBUG,
	trustHost: true,
	session: { strategy: 'jwt' },
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				identifier: { label: 'Email or Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const response = await create<{
						user: User;
						jwt: string;
						refreshToken: string;
					}>({
						path: 'auth/login',
						payload: credentials,
					});
					if (response?.jwt) {
						const cookieStore = await cookies();
						cookieStore.set('jwt', response.jwt, {
							httpOnly: true,
							sameSite: 'strict',
							secure: process.env.NODE_ENV === 'production',
							expires: add(new Date(), { minutes: 15 }),
						});
						cookieStore.set('refreshToken', response.refreshToken, {
							httpOnly: true,
							sameSite: 'strict',
							secure: process.env.NODE_ENV === 'production',
							expires: add(new Date(), { days: 7 }),
						});
						return {
							name: `${response.user.firstName} ${response.user.lastName}`.trim(),
							email: response.user.email,
							image: getUserAvatar(response.user),
							role: response.user.role,
						};
					}
					return null;
				} catch {
					const cookieStore = await cookies();
					cookieStore.delete('jwt');
					cookieStore.delete('refreshToken');
					return null;
				}
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user?.role) token.role = user?.role;
			return token;
		},
		session({ session, token }) {
			if (token?.role) session.user.role = token.role as User['role'];
			return session;
		},
	},
	events: {
		async signOut() {
			const cookieStore = await cookies();
			cookieStore.delete('jwt');
			cookieStore.delete('refreshToken');
		},
	},
	pages: {
		signIn: '/auth/login',
	},
	experimental: { enableWebAuthn: true },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
