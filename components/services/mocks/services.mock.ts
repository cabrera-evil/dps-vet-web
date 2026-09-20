export interface ServiceMock {
	id: string;
	name: string;
	description: string;
	durationMinutes: number;
	price: number;
	category: string;
	active: boolean;
}

export const servicesMock: ServiceMock[] = [
	{
		id: 'svc-1',
		name: 'Consulta general',
		description: 'Evaluación clínica completa y diagnóstico inicial.',
		durationMinutes: 30,
		price: 15,
		category: 'Consulta',
		active: true,
	},
	{
		id: 'svc-2',
		name: 'Vacunación',
		description: 'Aplicación de esquema de vacunas según especie y edad.',
		durationMinutes: 20,
		price: 12,
		category: 'Prevención',
		active: true,
	},
	{
		id: 'svc-3',
		name: 'Cirugía menor',
		description: 'Procedimientos ambulatorios de baja complejidad.',
		durationMinutes: 60,
		price: 85,
		category: 'Cirugía',
		active: true,
	},
	{
		id: 'svc-4',
		name: 'Desparasitación',
		description: 'Tratamiento antiparasitario interno y externo.',
		durationMinutes: 15,
		price: 10,
		category: 'Prevención',
		active: true,
	},
	{
		id: 'svc-5',
		name: 'Baño y peluquería',
		description: 'Higiene, corte de pelo y limpieza de oídos.',
		durationMinutes: 60,
		price: 18,
		category: 'Estética',
		active: true,
	},
	{
		id: 'svc-6',
		name: 'Radiografía',
		description: 'Estudio de imagen para diagnóstico osteoarticular.',
		durationMinutes: 30,
		price: 35,
		category: 'Diagnóstico',
		active: false,
	},
];
