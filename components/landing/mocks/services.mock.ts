import {
	ClipboardList,
	Hospital,
	ScanLine,
	Sparkles,
	Stethoscope,
	Syringe,
	type LucideIcon,
} from 'lucide-react';

export type ServiceCategory = 'preventivo' | 'quirurgico' | 'diagnostico';

export const serviceCategoryLabels: Record<ServiceCategory | 'todos', string> =
	{
		todos: 'Todos los Servicios',
		preventivo: 'Preventivos',
		quirurgico: 'Quirúrgicos',
		diagnostico: 'Diagnóstico',
	};

export interface ClinicalService {
	id: string;
	category: ServiceCategory;
	icon: LucideIcon;
	price: string;
	kicker: string;
	title: string;
	description: string;
	features: string[];
	cta: string;
	badge?: string;
}

export const clinicalServices: ClinicalService[] = [
	{
		id: 'consulta-general',
		category: 'preventivo',
		icon: ClipboardList,
		price: '$25.00 USD',
		kicker: 'Atención Ambulatoria',
		title: 'Consulta General y Preventiva',
		description:
			'Chequeo clínico sistémico completo: auscultación cardiopulmonar, revisión oftalmológica, control de peso, triaje dental y plan nutricional individualizado.',
		features: [
			'Apertura y sincronización de expediente digital',
			'Receta médica con firma electrónica',
		],
		cta: 'Agendar Consulta',
	},
	{
		id: 'vacunacion',
		category: 'preventivo',
		icon: Syringe,
		price: '$20.00 USD',
		kicker: 'Inmunización Biológica',
		title: 'Vacunación y Desparasitación',
		description:
			'Esquemas biológicos oficiales validados por el MAG El Salvador. Vacuna séxtuple canina, triple felina, rabia oficial con certificado sellado y desparasitación interna/externa.',
		features: [
			'Carnet físico y digital con recordatorios automáticos',
			'Biológicos importados con cadena de frío verificada',
		],
		cta: 'Agendar Vacunación',
	},
	{
		id: 'cirugia',
		category: 'quirurgico',
		icon: Stethoscope,
		price: 'Desde $120.00 USD',
		kicker: 'Cirugía & Anestesia',
		title: 'Cirugía y Quirófano Especializado',
		description:
			'Procedimientos de tejidos blandos, traumatología y esterilizaciones avanzadas bajo anestesia inhalatoria con Isoflurano y monitoreo multiparámetro continuo.',
		features: [
			'Monitoreo ECG, SpO2, capnografía y presión arterial',
			'Protocolo multimodal de control del dolor posoperatorio',
		],
		cta: 'Cotizar Procedimiento',
		badge: 'Unidad de Alta Complejidad',
	},
	{
		id: 'laboratorio',
		category: 'diagnostico',
		icon: ScanLine,
		price: 'Desde $35.00 USD',
		kicker: 'Diagnóstico Auxiliar',
		title: 'Laboratorio Clínico y Rayos X',
		description:
			'Hemograma computarizado, paneles bioquímicos de perfil renal/hepático, urianálisis, citologías, coprológicos y radiología digital directa con entrega inmediata.',
		features: [
			'Resultados diagnósticos en 45 minutos',
			'Envío directo en formato DICOM y PDF a tu WhatsApp',
		],
		cta: 'Consultar Estudios',
	},
	{
		id: 'estetica',
		category: 'preventivo',
		icon: Sparkles,
		price: '$18.00 USD',
		kicker: 'Higiene & Dermatología',
		title: 'Estética Médica y Grooming',
		description:
			'Baños dermatológicos con champú terapéutico (clorhexidina, ketoconazol), corte higiénico según estándar de raza, limpieza ótica profunda y vaciado de glándulas anales.',
		features: [
			'Supervisado por personal médico veterinario',
			'Equipos esterilizados con autoclave UV entre pacientes',
		],
		cta: 'Reservar Turno',
	},
	{
		id: 'hospitalizacion',
		category: 'quirurgico',
		icon: Hospital,
		price: '$45.00 USD / día',
		kicker: 'UCI Veterinaria',
		title: 'Hospitalización y Cuidado Intensivo',
		description:
			'Salas separadas e independientes para caninos y felinos para evitar estrés. Bombas de infusión volumétrica continua, oxigenoterapia y reporte médico diario.',
		features: [
			'Atención médica veterinaria 24 horas continuas',
			'Monitoreo de fluidoterapia e informe clínico matutino y vespertino',
		],
		cta: 'Protocolo de Ingreso',
	},
];
