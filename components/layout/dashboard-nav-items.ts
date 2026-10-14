import { Permission } from '@/constants/permission';
import {
	CalendarDays,
	LayoutDashboard,
	PawPrint,
	Pill,
	Settings,
	Stethoscope,
	Users,
	type LucideIcon,
} from 'lucide-react';

export interface DashboardNavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	/** Omitted (or empty) means every authenticated user can see the item —
	 * matches the corresponding API route's own auth requirement. */
	permissions?: Permission[];
	mode?: 'any' | 'all';
	/** Permission that marks the staff view; without it, `clientTitle` is shown. */
	staffPermission?: Permission;
	clientTitle?: string;
}

export function getNavTitle(
	item: DashboardNavItem,
	has: (required: Permission[]) => boolean
): string {
	return item.clientTitle &&
		item.staffPermission &&
		!has([item.staffPermission])
		? item.clientTitle
		: item.title;
}

export const dashboardNavItems: DashboardNavItem[] = [
	{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{
		title: 'Agenda de Citas',
		href: '/dashboard/appointments',
		icon: CalendarDays,
		permissions: [Permission.APPOINTMENTS_READ],
		staffPermission: Permission.APPOINTMENTS_MANAGE_ALL,
		clientTitle: 'Mis Citas',
	},
	{
		title: 'Pacientes',
		href: '/dashboard/patients',
		icon: PawPrint,
		permissions: [Permission.PETS_READ],
		staffPermission: Permission.PETS_MANAGE_ALL,
		clientTitle: 'Mis Mascotas',
	},
	{
		title: 'Servicios Clínicos',
		href: '/dashboard/services',
		icon: Stethoscope,
		permissions: [Permission.SERVICES_WRITE],
	},
	{
		title: 'Clientes y Tutores',
		href: '/dashboard/clients',
		icon: Users,
		permissions: [Permission.USERS_READ],
	},
	{
		title: 'Inventario y Medicamentos',
		href: '/dashboard/inventory',
		icon: Pill,
		permissions: [Permission.MEDICATIONS_WRITE],
	},
	{
		title: 'Configuración',
		href: '/dashboard/settings',
		icon: Settings,
		permissions: [Permission.USERS_UPDATE],
	},
];
