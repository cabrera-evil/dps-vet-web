import type { DashboardStat } from '@/components/dashboard/dashboard-stat-card';
import { DollarSign, PawPrint } from 'lucide-react';

export const dashboardStats: DashboardStat[] = [
	{
		label: 'Pacientes activos',
		value: '248',
		description: '+8 este mes',
		icon: PawPrint,
	},
	{
		label: 'Consulas y Procedimientos',
		value: '1',
		description: 'Consultas y procedimientos realizados este mes',
		icon: DollarSign,
	},
];

export interface DashboardStaffOnDuty {
	id: string;
	name: string;
	role: string;
	initials: string;
	status: 'on-duty' | 'break' | 'off-duty';
}

export const dashboardStaffOnDuty: DashboardStaffOnDuty[] = [
	{
		id: 'staff-1',
		name: 'Dra. Gómez',
		role: 'Cirugía y Cuidados Críticos',
		initials: 'MG',
		status: 'on-duty',
	},
	{
		id: 'staff-2',
		name: 'Dr. Alvarado',
		role: 'Medicina Interna',
		initials: 'JA',
		status: 'on-duty',
	},
	{
		id: 'staff-3',
		name: 'Téc. Reyes',
		role: 'Asistencia Clínica',
		initials: 'LR',
		status: 'break',
	},
];
