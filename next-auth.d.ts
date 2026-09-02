import { DefaultSession } from 'next-auth';
import { Role } from './constants/enum';

declare module 'next-auth' {
	interface Session {
		user: User & DefaultSession['user'];
	}

	interface User {
		role: Role;
	}

	interface JWT {
		accessToken?: string;
	}
}
