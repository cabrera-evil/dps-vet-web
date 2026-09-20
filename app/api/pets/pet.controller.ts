import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, noContent, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createPetSchema,
	listPetsQuerySchema,
	updatePetSchema,
} from './pet.schema';
import type { PetService } from './pet.service';

/**
 * Translates HTTP <-> {@link PetService}. Owns request parsing/validation and
 * response shaping only — no domain rules, no Firestore types.
 */
export class PetController {
	constructor(private readonly service: PetService) {}

	async list(request: NextRequest, identity: Identity): Promise<NextResponse> {
		const query = parseSearchParams(request, listPetsQuerySchema);
		const { items, pagination } = await this.service.list(identity, query);
		return ok(items, { pagination });
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}

	async create(request: Request, identity: Identity): Promise<NextResponse> {
		const input = await parseBody(request, createPetSchema);
		return created(await this.service.create(identity, input));
	}

	async update(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, updatePetSchema);
		return ok(await this.service.update(identity, id, input));
	}

	async remove(identity: Identity, id: string): Promise<NextResponse> {
		await this.service.remove(identity, id);
		return noContent();
	}
}
