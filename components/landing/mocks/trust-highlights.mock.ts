import {
	Activity,
	Award,
	FlaskConical,
	FolderCheck,
	Receipt,
	Siren,
	type LucideIcon,
} from 'lucide-react';

export interface HeroProofPoint {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
}

export const heroProofPoints: HeroProofPoint[] = [
	{
		id: 'experience',
		icon: Award,
		title: '+15 Años',
		description: 'Cuidando pacientes',
	},
	{
		id: 'certified',
		icon: Activity,
		title: 'Certificados',
		description: 'Aval oficial MAG SV',
	},
	{
		id: 'emergency',
		icon: Siren,
		title: 'Guardia 24h',
		description: 'Médico presencial',
	},
];

export interface ClinicBenefit {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
}

export const clinicBenefits: ClinicBenefit[] = [
	{
		id: 'records',
		icon: FolderCheck,
		title: 'Expediente Digital 24/7',
		description:
			'Acceso instantáneo a vacunas, recetas y evolución desde tu móvil.',
	},
	{
		id: 'surgery',
		icon: Activity,
		title: 'Quirófano & Urgencias',
		description:
			'Médico cirujano presencial en turnos rotativos continuos sin interrupción.',
	},
	{
		id: 'lab',
		icon: FlaskConical,
		title: 'Imágenes & Laboratorio',
		description:
			'Ecografía Doppler, Rayos X digital y químicas sanguíneas en 45 minutos.',
	},
	{
		id: 'billing',
		icon: Receipt,
		title: 'Facturación DTE El Salvador',
		description:
			'Comprobante de Crédito Fiscal y Factura Electrónica directa al correo.',
	},
];
