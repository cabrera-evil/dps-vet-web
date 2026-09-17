import type { Permission } from '@/constants/permission';

export interface RoleDocument {
	name: string;
	permissions: Permission[];
}
