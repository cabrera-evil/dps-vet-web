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
	{
		code: Permission.PETS_READ,
		description: 'View own pets',
	},
	{
		code: Permission.PETS_WRITE,
		description: 'Create, update, or delete own pets',
	},
	{
		code: Permission.PETS_MANAGE_ALL,
		description: "Bypass ownership checks on any client's pets",
	},
	{
		code: Permission.SERVICES_WRITE,
		description: 'Create, update, or delete catalog services',
	},
	{
		code: Permission.APPOINTMENTS_READ,
		description: 'View own appointments',
	},
	{
		code: Permission.APPOINTMENTS_WRITE,
		description: 'Create or cancel own appointments',
	},
	{
		code: Permission.APPOINTMENTS_MANAGE_ALL,
		description:
			'View all appointments and transition status (confirm/attend/no-show)',
	},
	{
		code: Permission.MEDICAL_RECORDS_READ,
		description: "View own pets' medical records",
	},
	{
		code: Permission.MEDICAL_RECORDS_WRITE,
		description: 'Create or update medical records',
	},
	{
		code: Permission.MEDICAL_RECORDS_MANAGE_ALL,
		description: "Bypass ownership checks on any client's medical records",
	},
	{
		code: Permission.MEDICATIONS_WRITE,
		description: 'Create, update, or delete catalog medications',
	},
	{
		code: Permission.ORDERS_READ,
		description: 'View own orders',
	},
	{
		code: Permission.ORDERS_WRITE,
		description: 'Create own orders',
	},
	{
		code: Permission.ORDERS_MANAGE_ALL,
		description: 'View all orders and transition fulfillment status',
	},
	{
		code: Permission.REPORTS_READ,
		description: 'View aggregate reports',
	},
];
