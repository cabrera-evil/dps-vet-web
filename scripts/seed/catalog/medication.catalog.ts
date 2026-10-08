import type { Medication } from '@/app/api/medications/medication.schema';

export type MedicationCatalogEntry = Medication;

/** Starter inventory for the `medications` Firestore collection — matches the
 * shape validated by `app/api/medications/medication.schema.ts`. */
export const MEDICATION_CATALOG: MedicationCatalogEntry[] = [
	{
		name: 'Amoxicilina 250mg',
		description: 'Antibiótico de amplio espectro, caja x 20 cápsulas.',
		stock: 4,
		price: 8.5,
		active: true,
	},
	{
		name: 'Meloxicam inyectable',
		description: 'Antiinflamatorio no esteroideo, frasco 50ml.',
		stock: 2,
		price: 14,
		active: true,
	},
	{
		name: 'Suero fisiológico 500ml',
		description: 'Solución isotónica para hidratación.',
		stock: 6,
		price: 3.25,
		active: true,
	},
	{
		name: 'Vacuna polivalente canina',
		description: 'Esquema de vacunación anual, frasco unidosis.',
		stock: 25,
		price: 9.75,
		active: true,
	},
	{
		name: 'Desparasitante Ivermectina',
		description: 'Tratamiento antiparasitario interno, frasco 100ml.',
		stock: 18,
		price: 6.4,
		active: true,
	},
	{
		name: 'Shampoo medicado antimicótico',
		description: 'Uso tópico para afecciones dermatológicas.',
		stock: 0,
		price: 11,
		active: false,
	},
];
