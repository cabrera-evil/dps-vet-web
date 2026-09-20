import { Permission } from '@/constants/permission';
import { RoleName } from '@/constants/roles';

export interface RoleCatalogEntry {
	name: RoleName;
	permissions: Permission[];
}

/**
 * Source of truth for the `roles` Firestore collection. A role is nothing
 * but a named group of permissions — there is no role hierarchy or role→
 * permission table in application code; a user's `permissions` custom claim
 * is assigned from whichever role document applies to them, administered
 * here and in Firestore, not hardcoded into authorization logic. `RoleName`
 * only types the initial seeded names for safety against typos — it plays
 * no part in any authorization decision.
 */
export const ROLE_CATALOG: RoleCatalogEntry[] = [
	{
		name: RoleName.CLIENTE,
		permissions: [
			Permission.PETS_READ,
			Permission.PETS_WRITE,
			Permission.APPOINTMENTS_READ,
			Permission.APPOINTMENTS_WRITE,
			Permission.MEDICAL_RECORDS_READ,
			Permission.ORDERS_READ,
			Permission.ORDERS_WRITE,
		],
	},
	{
		name: RoleName.EMPLEADO,
		permissions: [
			Permission.CONTACTS_READ,
			Permission.CONTACTS_UPDATE,
			Permission.CONTACTS_DELETE,
			Permission.USERS_READ,
			Permission.PETS_READ,
			Permission.PETS_WRITE,
			Permission.PETS_MANAGE_ALL,
			Permission.APPOINTMENTS_READ,
			Permission.APPOINTMENTS_WRITE,
			Permission.APPOINTMENTS_MANAGE_ALL,
			Permission.MEDICAL_RECORDS_READ,
			Permission.MEDICAL_RECORDS_WRITE,
			Permission.MEDICAL_RECORDS_MANAGE_ALL,
			Permission.ORDERS_READ,
			Permission.ORDERS_WRITE,
			Permission.ORDERS_MANAGE_ALL,
		],
	},
	{
		name: RoleName.ADMINISTRADOR,
		permissions: [
			Permission.CONTACTS_READ,
			Permission.CONTACTS_UPDATE,
			Permission.CONTACTS_DELETE,
			Permission.USERS_READ,
			Permission.USERS_UPDATE,
			Permission.PETS_READ,
			Permission.PETS_WRITE,
			Permission.PETS_MANAGE_ALL,
			Permission.SERVICES_WRITE,
			Permission.APPOINTMENTS_READ,
			Permission.APPOINTMENTS_WRITE,
			Permission.APPOINTMENTS_MANAGE_ALL,
			Permission.MEDICAL_RECORDS_READ,
			Permission.MEDICAL_RECORDS_WRITE,
			Permission.MEDICAL_RECORDS_MANAGE_ALL,
			Permission.MEDICATIONS_WRITE,
			Permission.ORDERS_READ,
			Permission.ORDERS_WRITE,
			Permission.ORDERS_MANAGE_ALL,
			Permission.REPORTS_READ,
		],
	},
];
