import { User } from '@/schemas/user.schema';
import gravatar from 'gravatar';

export function getUserAvatar(user: User): string {
	return (
		user.picture?.secureUrl ??
		gravatar.url(user.email, { protocol: 'https', s: '300' })
	);
}
