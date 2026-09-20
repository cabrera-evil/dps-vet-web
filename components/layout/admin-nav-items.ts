import {
	CalendarDays,
	LayoutDashboard,
	PawPrint,
	Pill,
	Stethoscope,
	Users,
	type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
	title: string;
	href: string;
	icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
	{ title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
	{
		title: 'Agenda de Citas',
		href: '/admin/appointments',
		icon: CalendarDays,
	},
	{ title: 'Pacientes', href: '/admin/patients', icon: PawPrint },
	{ title: 'Servicios Clínicos', href: '/admin/services', icon: Stethoscope },
	{ title: 'Clientes y Tutores', href: '/admin/clients', icon: Users },
	{
		title: 'Inventario y Medicamentos',
		href: '/admin/inventory',
		icon: Pill,
	},
];
