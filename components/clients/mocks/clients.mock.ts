export interface ClientMock {
	id: string;
	name: string;
	email: string;
	phone: string;
	petNames: string[];
	createdAt: string;
}

export const clientsMock: ClientMock[] = [
	{
		id: 'user-1',
		name: 'Ana Martínez',
		email: 'ana.martinez@example.com',
		phone: '+503 7123-4567',
		petNames: ['Max'],
		createdAt: '2024-02-10',
	},
	{
		id: 'user-2',
		name: 'Carlos Hernández',
		email: 'carlos.hernandez@example.com',
		phone: '+503 7234-5678',
		petNames: ['Luna'],
		createdAt: '2024-05-22',
	},
	{
		id: 'user-3',
		name: 'Fátima López',
		email: 'fatima.lopez@example.com',
		phone: '+503 7345-6789',
		petNames: ['Rocky'],
		createdAt: '2023-11-03',
	},
	{
		id: 'user-4',
		name: 'José Ramírez',
		email: 'jose.ramirez@example.com',
		phone: '+503 7456-7890',
		petNames: ['Michi'],
		createdAt: '2025-01-15',
	},
	{
		id: 'user-5',
		name: 'Marta Cruz',
		email: 'marta.cruz@example.com',
		phone: '+503 7567-8901',
		petNames: ['Toby'],
		createdAt: '2024-08-30',
	},
	{
		id: 'user-6',
		name: 'Pedro Salinas',
		email: 'pedro.salinas@example.com',
		phone: '+503 7678-9012',
		petNames: ['Kira', 'Simón'],
		createdAt: '2023-06-19',
	},
];
