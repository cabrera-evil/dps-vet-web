import { Permission } from '@/constants/permission';

export interface PermissionCatalogEntry {
	code: Permission;
	description: string;
}

/**
 * Source of truth for the `permissions` Firestore collection. The
 * `Permission` enum stays in application code for type safety, but the
 * actual granted/available permission registry lives in Firestore, seeded
 * from this catalog.
 */
export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
	{
		code: Permission.CONTACTS_READ,
		description: 'View submitted contact messages',
	},
	{
		code: Permission.CONTACTS_UPDATE,
		description: 'Update the status of a contact message',
	},
	{
		code: Permission.CONTACTS_DELETE,
		description: 'Delete a contact message',
	},
	{
		code: Permission.USERS_READ,
		description: 'View user profiles',
	},
	{
		code: Permission.USERS_UPDATE,
		description: "Change a user's role",
	},
];
