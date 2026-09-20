import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, noContent, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createAppointmentSchema,
	listAppointmentsQuerySchema,
	updateAppointmentStatusSchema,
} from './appointment.schema';
import type { AppointmentService } from './appointment.service';

/**
 * Translates HTTP <-> {@link AppointmentService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class AppointmentController {
	constructor(private readonly service: AppointmentService) {}

	async list(request: NextRequest, identity: Identity): Promise<NextResponse> {
		const query = parseSearchParams(request, listAppointmentsQuerySchema);
		const { items, pagination } = await this.service.list(identity, query);
		return ok(items, { pagination });
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}

	async create(request: Request, identity: Identity): Promise<NextResponse> {
		const input = await parseBody(request, createAppointmentSchema);
		return created(await this.service.create(identity, input));
	}

	async cancel(identity: Identity, id: string): Promise<NextResponse> {
		await this.service.cancel(identity, id);
		return noContent();
	}

	async updateStatus(
		request: Request,
		identity: Identity,
		id: string
	): Promise<NextResponse> {
		const input = await parseBody(request, updateAppointmentStatusSchema);
		return ok(await this.service.updateStatus(identity, id, input));
	}
}
