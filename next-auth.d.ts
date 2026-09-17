import { DefaultSession } from 'next-auth';
import { Permission } from './constants/permission';

declare module 'next-auth' {
	interface Session {
		user: User & DefaultSession['user'];
	}

	interface User {
		uid: string;
		permissions: Permission[];
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		uid?: string;
		permissions?: Permission[];
	}
}
