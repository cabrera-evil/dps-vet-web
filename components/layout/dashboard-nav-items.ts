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
}

export const dashboardNavItems: DashboardNavItem[] = [
	{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{
		title: 'Agenda de Citas',
		href: '/dashboard/appointments',
		icon: CalendarDays,
	},
	{ title: 'Pacientes', href: '/dashboard/patients', icon: PawPrint },
	{
		title: 'Servicios Clínicos',
		href: '/dashboard/services',
		icon: Stethoscope,
	},
	{ title: 'Clientes y Tutores', href: '/dashboard/clients', icon: Users },
	{
		title: 'Inventario y Medicamentos',
		href: '/dashboard/inventory',
		icon: Pill,
	},
];
