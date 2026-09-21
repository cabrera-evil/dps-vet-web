import { Permission } from '@/constants/permission';
import {
	CalendarDays,
	LayoutDashboard,
	PawPrint,
	Pill,
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
}

export const dashboardNavItems: DashboardNavItem[] = [
	{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{
		title: 'Agenda de Citas',
		href: '/dashboard/appointments',
		icon: CalendarDays,
		permissions: [Permission.APPOINTMENTS_READ],
	},
	{
		title: 'Pacientes',
		href: '/dashboard/patients',
		icon: PawPrint,
		permissions: [Permission.PETS_READ],
	},
	{
		title: 'Servicios Clínicos',
		href: '/dashboard/services',
		icon: Stethoscope,
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
	},
];
