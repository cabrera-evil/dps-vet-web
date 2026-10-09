import { PetSex } from '@/constants/enum';

export interface Pet {
	id: string;
	ownerId: string;
	name: string;
	species: string;
	breed: string;
	birthDate: string;
	notes?: string;
	sex?: PetSex;
	sterilized?: boolean;
	color?: string;
	markings?: string;
	microchip?: string;
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
