import { Permission } from '@/constants/permission';
import { useGet } from '@/hooks/use-rest';
import { AppointmentClient } from '@/types/appointment.type';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';

/**
 * Resolves a pet's `ownerId` to a display name. `/users` is only
 * fetched when the caller has `USERS_READ` (staff/admin) — a plain client
 * never has it and never needs it, since they only ever see their own pets.
 */
export function usePetDirectory() {
	const { data: session } = useSession();
	const canManageAll = hasPermission(session?.user?.permissions, [
		Permission.PETS_MANAGE_ALL,
	]);
	const canReadUsers = hasPermission(session?.user?.permissions, [
		Permission.USERS_READ,
	]);

	const { data: users } = useGet<AppointmentClient[]>(
		{ path: '/users', params: { pageSize: 100 } },
		{ enabled: canReadUsers }
	);

	const usersById = new Map((users ?? []).map((user) => [user.id, user]));
	const currentUserId = session?.user?.uid;

	return {
		canManageAll,
		getOwnerName: (ownerId: string) =>
			ownerId === currentUserId
				? 'Tú'
				: (usersById.get(ownerId)?.name ?? ownerId),
	};
}
