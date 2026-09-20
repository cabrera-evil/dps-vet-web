import {
	CalendarRange,
	ClipboardCheck,
	MessageSquareText,
	type LucideIcon,
} from 'lucide-react';

export interface BookingStep {
	id: string;
	step: number;
	icon: LucideIcon;
	title: string;
	description: string;
}

export const bookingSteps: BookingStep[] = [
	{
		id: 'select-service',
		step: 1,
		icon: ClipboardCheck,
		title: 'Selecciona el Servicio y Paciente',
		description:
			'Indica si requieres consulta preventiva, refuerzo de vacunas, evaluación de urgencia o estudio de diagnóstico, especificando raza y peso aproximado.',
	},
	{
		id: 'choose-schedule',
		step: 2,
		icon: CalendarRange,
		title: 'Elige Fecha y Horario Cómodo',
		description:
			'Visualiza los espacios disponibles en tiempo real con el médico de tu preferencia. Nuestro horario regular cubre de lunes a sábado de 7:00 AM a 7:00 PM.',
	},
	{
		id: 'confirmation',
		step: 3,
		icon: MessageSquareText,
		title: 'Confirmación y Recordatorio',
		description:
			'Recibe el comprobante instantáneo en tu teléfono con enlace a Waze/Google Maps y recomendaciones previas (ayuno si requiere análisis o cirugía).',
	},
];
