import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: User & DefaultSession['user'];
	}

	interface User {
		uid: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		uid?: string;
	}
}
