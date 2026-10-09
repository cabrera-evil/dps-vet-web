import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody } from '@/app/api/_shared/http/request';
import { created, ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import {
	createConsultationSchema,
	updateConsultationSchema,
} from './consultation.schema';
import type { ConsultationService } from './consultation.service';

/**
 * Translates HTTP <-> {@link ConsultationService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class ConsultationController {
	constructor(private readonly service: ConsultationService) {}

	async create(
		request: Request,
		identity: Identity,
		petId: string
	): Promise<NextResponse> {
		const input = await parseBody(request, createConsultationSchema);
		return created(await this.service.create(identity, petId, input));
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}

	async update(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, updateConsultationSchema);
		return ok(await this.service.update(identity, id, input));
	}

	async finalize(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.finalize(identity, id));
	}
}
