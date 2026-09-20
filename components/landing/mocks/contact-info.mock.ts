import { Clock, MapPin, Phone, type LucideIcon } from 'lucide-react';

export interface ContactCard {
	id: string;
	icon: LucideIcon;
	title: string;
	lines: string[];
	links?: { label: string; href: string }[];
}

export const contactCards: ContactCard[] = [
	{
		id: 'address',
		icon: MapPin,
		title: 'Dirección Clínica',
		lines: [
			'Av. Las Magnolias #142, Colonia San Benito, San Salvador. Frente a Plaza San Benito.',
		],
		links: [
			{
				label: 'Abrir en Google Maps',
				href: 'https://maps.google.com/?q=San+Benito+San+Salvador',
			},
			{
				label: 'Waze',
				href: 'https://waze.com/ul?q=San+Benito+San+Salvador',
			},
		],
	},
	{
		id: 'hours',
		icon: Clock,
		title: 'Horarios Clínicos',
		lines: [
			'Consulta regular: Lunes a Sábado de 7:00 AM a 7:00 PM',
			'Urgencias y Quirófano: 24 horas continuas (todos los días del año)',
		],
	},
	{
		id: 'phones',
		icon: Phone,
		title: 'Canales Telefónicos',
		lines: [
			'PBX Clínica: +503 2257-8900',
			'WhatsApp Urgencias: +503 7890-1234',
			'Correo electrónico: citas@veterinariasanroque.com.sv',
		],
	},
];
