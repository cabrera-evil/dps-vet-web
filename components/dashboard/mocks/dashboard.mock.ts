import {
	CalendarClock,
	DollarSign,
	PawPrint,
	TriangleAlert,
	type LucideIcon,
} from 'lucide-react';

export interface DashboardStat {
	label: string;
	value: string;
	description: string;
	icon: LucideIcon;
}

export const dashboardStats: DashboardStat[] = [
	{
		label: 'Citas hoy',
		value: '12',
		description: '3 pendientes de confirmar',
		icon: CalendarClock,
	},
	{
		label: 'Pacientes activos',
		value: '248',
		description: '+8 este mes',
		icon: PawPrint,
	},
	{
		label: 'Medicamentos con bajo stock',
		value: '5',
		description: 'Requieren reabastecimiento',
		icon: TriangleAlert,
	},
	{
		label: 'Ingresos del día',
		value: '$420.00 USD',
		description: '18 servicios facturados',
		icon: DollarSign,
	},
];

export interface DashboardLowStockMedication {
	id: string;
	name: string;
	stock: number;
}

export const dashboardLowStockMedications: DashboardLowStockMedication[] = [
	{ id: 'med-1', name: 'Amoxicilina 250mg', stock: 4 },
	{ id: 'med-2', name: 'Meloxicam inyectable', stock: 2 },
	{ id: 'med-3', name: 'Suero fisiológico 500ml', stock: 6 },
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
