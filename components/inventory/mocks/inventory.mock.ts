export interface MedicationMock {
	id: string;
	name: string;
	description: string;
	stock: number;
	price: number;
	active: boolean;
}

export const LOW_STOCK_THRESHOLD = 10;

export const medicationsMock: MedicationMock[] = [
	{
		id: 'med-1',
		name: 'Amoxicilina 250mg',
		description: 'Antibiótico de amplio espectro, caja x 20 cápsulas.',
		stock: 4,
		price: 8.5,
		active: true,
	},
	{
		id: 'med-2',
		name: 'Meloxicam inyectable',
		description: 'Antiinflamatorio no esteroideo, frasco 50ml.',
		stock: 2,
		price: 14.0,
		active: true,
	},
	{
		id: 'med-3',
		name: 'Suero fisiológico 500ml',
		description: 'Solución isotónica para hidratación.',
		stock: 6,
		price: 3.25,
		active: true,
	},
	{
		id: 'med-4',
		name: 'Vacuna polivalente canina',
		description: 'Esquema de vacunación anual, frasco unidosis.',
		stock: 25,
		price: 9.75,
		active: true,
	},
	{
		id: 'med-5',
		name: 'Desparasitante Ivermectina',
		description: 'Tratamiento antiparasitario interno, frasco 100ml.',
		stock: 18,
		price: 6.4,
		active: true,
	},
	{
		id: 'med-6',
		name: 'Shampoo medicado antimicótico',
		description: 'Uso tópico para afecciones dermatológicas.',
		stock: 0,
		price: 11.0,
		active: false,
	},
];
