import { HeartPulse, PawPrint, type LucideIcon } from 'lucide-react';

export interface ClinicHighlight {
	id: string;
	icon: LucideIcon;
	value: string;
	label: string;
}

export const clinicHighlights: ClinicHighlight[] = [
	{
		id: 'patients',
		icon: PawPrint,
		value: '14,200+',
		label: 'Expedientes clínicos caninos y felinos activos.',
	},
	{
		id: 'surgery',
		icon: HeartPulse,
		value: 'Quirófano A-1',
		label: 'Disponibilidad inmediata para cirugías de trauma.',
	},
];

export interface ClinicStaffOnDuty {
	id: string;
	initials: string;
	name: string;
	role: string;
}

export const clinicStaffOnDuty: ClinicStaffOnDuty[] = [
	{
		id: 'staff-1',
		initials: 'DR',
		name: 'Dra. San Roque G.',
		role: 'Jefa de Cirugía y Cuidados Críticos',
	},
	{
		id: 'staff-2',
		initials: 'MV',
		name: 'Dr. R. Palomo M.',
		role: 'Medicina Interna y Triage',
	},
];
