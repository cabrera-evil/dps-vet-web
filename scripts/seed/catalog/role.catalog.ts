import { Permission } from '@/constants/permission';

export interface RoleCatalogEntry {
	name: string;
	permissions: Permission[];
}

/**
 * Source of truth for the `roles` Firestore collection. A role is nothing
 * but a named group of permissions — there is no role enum or role→
 * permission table in application code; a user's `permissions` custom claim
 * is assigned from whichever role document applies to them, administered
 * here and in Firestore, not hardcoded into authorization logic.
 */
export const ROLE_CATALOG: RoleCatalogEntry[] = [
	{ name: 'CLIENTE', permissions: [] },
	{
		name: 'EMPLEADO',
		permissions: [
			Permission.CONTACTS_READ,
			Permission.CONTACTS_UPDATE,
			Permission.CONTACTS_DELETE,
		],
	},
	{
		name: 'ADMINISTRADOR',
		permissions: [
			Permission.CONTACTS_READ,
			Permission.CONTACTS_UPDATE,
			Permission.CONTACTS_DELETE,
		],
	},
];
