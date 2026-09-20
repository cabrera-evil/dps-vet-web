import {
	FolderSync,
	GraduationCap,
	MessageCircle,
	Smile,
	type LucideIcon,
} from 'lucide-react';

export interface ClinicPillar {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
}

export const clinicPillars: ClinicPillar[] = [
	{
		id: 'certified-staff',
		icon: GraduationCap,
		title: 'Cuerpo Médico Certificado MAG',
		description:
			'Nuestros veterinarios cuentan con registro activo en el Ministerio de Agricultura y Ganadería de El Salvador y educación médica continua en medicina interna y cirugía.',
	},
	{
		id: 'paperless-records',
		icon: FolderSync,
		title: 'Expediente Sin Papeles',
		description:
			'Toda la biometría, cirugías, dosis administradas y analíticas quedan sincronizadas en tu perfil. Nunca perderás el historial de tu mascota aunque viajes.',
	},
	{
		id: 'whatsapp-followup',
		icon: MessageCircle,
		title: 'Seguimiento Vía WhatsApp',
		description:
			'No te dejamos solo después de la consulta. Nuestro equipo de enfermería veterinaria monitorea la evolución postoperatoria y farmacológica por mensajería.',
	},
	{
		id: 'fear-free',
		icon: Smile,
		title: 'Ambiente Fear-Free',
		description:
			'Diseño acústico y aromático controlado con difusores de feromonas felinas y caninas para reducir sustancialmente los niveles de estrés en consulta y hospitalización.',
	},
];
