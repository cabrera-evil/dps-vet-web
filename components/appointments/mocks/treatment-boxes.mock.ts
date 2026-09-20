export type TreatmentBoxStatus = 'available' | 'occupied' | 'cleaning';

export interface TreatmentBox {
	id: string;
	name: string;
	status: TreatmentBoxStatus;
	detail: string;
}

export const treatmentBoxesMock: TreatmentBox[] = [
	{
		id: 'box-1',
		name: 'Box 1 - Consulta general',
		status: 'occupied',
		detail: 'Max con Dra. Gómez',
	},
	{
		id: 'box-2',
		name: 'Box 2 - Vacunación',
		status: 'available',
		detail: 'Disponible',
	},
	{
		id: 'box-3',
		name: 'Box 3 - Cirugía menor',
		status: 'cleaning',
		detail: 'Limpieza en curso',
	},
	{
		id: 'box-4',
		name: 'Box 4 - Diagnóstico por imagen',
		status: 'available',
		detail: 'Disponible',
	},
];
