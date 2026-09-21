export interface Pet {
	id: string;
	ownerId: string;
	name: string;
	species: string;
	breed: string;
	birthDate: string;
	notes?: string;
	createdAt: string;
}

export interface CreatePetPayload {
	name: string;
	species: string;
	breed: string;
	birthDate: string;
	notes?: string;
}

export type UpdatePetPayload = Partial<CreatePetPayload>;
