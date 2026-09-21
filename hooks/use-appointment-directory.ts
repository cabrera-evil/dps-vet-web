import { Permission } from '@/constants/permission';
import { useGet } from '@/hooks/use-rest';
import {
	AppointmentClient,
	AppointmentPet,
	AppointmentService,
} from '@/types/appointment.type';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';

/**
 * Resolves appointment foreign ids (pet/service/client/staff) to display
 * names. `/users` is only fetched when the caller has `USERS_READ`
 * (staff/admin) — a plain client never has it, so their own name is derived
 * from the session instead.
 */
export function useAppointmentDirectory() {
	const { data: session } = useSession();
	const canManageAll = hasPermission(session?.user?.permissions, [
		Permission.APPOINTMENTS_MANAGE_ALL,
	]);
	const canReadUsers = hasPermission(session?.user?.permissions, [
		Permission.USERS_READ,
	]);

	const { data: pets } = useGet<AppointmentPet[]>({
		path: '/pets',
		params: { pageSize: 100 },
	});
	const { data: services } = useGet<AppointmentService[]>({
		path: '/services',
		params: { pageSize: 100 },
	});
	const { data: users } = useGet<AppointmentClient[]>(
		{ path: '/users', params: { pageSize: 100 } },
		{ enabled: canReadUsers }
	);

	const petsById = new Map((pets ?? []).map((pet) => [pet.id, pet]));
	const servicesById = new Map(
		(services ?? []).map((service) => [service.id, service])
	);
	const usersById = new Map((users ?? []).map((user) => [user.id, user]));
	const currentUserId = session?.user?.uid;

	return {
		canManageAll,
		currentUserId,
		getPetName: (petId: string) => petsById.get(petId)?.name ?? petId,
		getServiceName: (serviceId: string) =>
			servicesById.get(serviceId)?.name ?? serviceId,
		getUserName: (userId: string) =>
			userId === currentUserId ? 'Tú' : (usersById.get(userId)?.name ?? userId),
	};
}
