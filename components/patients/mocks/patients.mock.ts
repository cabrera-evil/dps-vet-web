export interface PatientMock {
	id: string;
	name: string;
	species: string;
	breed: string;
	birthDate: string;
	ownerName: string;
}

export const patientsMock: PatientMock[] = [
	{
		id: 'pet-1',
		name: 'Max',
		species: 'Perro',
		breed: 'Labrador Retriever',
		birthDate: '2021-03-14',
		ownerName: 'Ana Martínez',
	},
	{
		id: 'pet-2',
		name: 'Luna',
		species: 'Gato',
		breed: 'Siamés',
		birthDate: '2022-07-02',
		ownerName: 'Carlos Hernández',
	},
	{
		id: 'pet-3',
		name: 'Rocky',
		species: 'Perro',
		breed: 'Bulldog Francés',
		birthDate: '2019-11-30',
		ownerName: 'Fátima López',
	},
	{
		id: 'pet-4',
		name: 'Michi',
		species: 'Gato',
		breed: 'Común europeo',
		birthDate: '2023-01-18',
		ownerName: 'José Ramírez',
	},
	{
		id: 'pet-5',
		name: 'Toby',
		species: 'Perro',
		breed: 'Poodle',
		birthDate: '2020-05-09',
		ownerName: 'Marta Cruz',
	},
	{
		id: 'pet-6',
		name: 'Kira',
		species: 'Perro',
		breed: 'Pastor Alemán',
		birthDate: '2018-09-22',
		ownerName: 'Pedro Salinas',
	},
];
