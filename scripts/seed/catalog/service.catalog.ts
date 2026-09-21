export interface ServiceCatalogEntry {
	name: string;
	description: string;
	durationMinutes: number;
	price: number;
	category: string;
	active: boolean;
}

/** Source of truth for the `services` Firestore collection's starter
 * catalog — matches the shape validated by `app/api/services/service.schema.ts`. */
export const SERVICE_CATALOG: ServiceCatalogEntry[] = [
	{
		name: 'Consulta General',
		description: 'Evaluación clínica general y diagnóstico inicial.',
		durationMinutes: 30,
		price: 15,
		category: 'Consulta',
		active: true,
	},
	{
		name: 'Vacunación',
		description: 'Aplicación de vacunas según el esquema de la mascota.',
		durationMinutes: 20,
		price: 12,
		category: 'Prevención',
		active: true,
	},
	{
		name: 'Desparasitación',
		description: 'Tratamiento antiparasitario interno y externo.',
		durationMinutes: 15,
		price: 8,
		category: 'Prevención',
		active: true,
	},
	{
		name: 'Baño y Peluquería',
		description: 'Baño medicado, corte de pelo y limpieza de oídos.',
		durationMinutes: 60,
		price: 18,
		category: 'Estética',
		active: true,
	},
	{
		name: 'Cirugía Menor',
		description: 'Procedimientos quirúrgicos ambulatorios de baja complejidad.',
		durationMinutes: 90,
		price: 80,
		category: 'Cirugía',
		active: true,
	},
	{
		name: 'Esterilización',
		description:
			'Cirugía de esterilización (castración u ovariohisterectomía).',
		durationMinutes: 120,
		price: 65,
		category: 'Cirugía',
		active: true,
	},
	{
		name: 'Radiografía',
		description: 'Estudio radiográfico digital para diagnóstico por imagen.',
		durationMinutes: 30,
		price: 35,
		category: 'Diagnóstico',
		active: true,
	},
	{
		name: 'Perfil de Laboratorio',
		description: 'Panel de análisis clínico (hematología y química sanguínea).',
		durationMinutes: 20,
		price: 40,
		category: 'Diagnóstico',
		active: true,
	},
];
