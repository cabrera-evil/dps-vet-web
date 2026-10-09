import { RoleName } from '@/constants/roles';
import { useGet } from '@/hooks/use-rest';
import type { Client } from '@/types/client.type';

/** Registered clients (role `CLIENTE`); requires `USERS_READ`, so enable it only for staff. */
export function useClients(enabled: boolean) {
	const { data, isLoading } = useGet<Client[]>(
		{ path: '/users', params: { role: RoleName.CLIENTE, pageSize: 100 } },
		{ enabled }
	);

	return { clients: data ?? [], isLoading: enabled && isLoading };
}
