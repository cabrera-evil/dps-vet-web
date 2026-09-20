import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, noContent, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createMedicationSchema,
	listMedicationsQuerySchema,
	updateMedicationSchema,
} from './medication.schema';
import type { MedicationCatalogService } from './medication.service';

/**
 * Translates HTTP <-> {@link MedicationCatalogService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class MedicationController {
	constructor(private readonly service: MedicationCatalogService) {}

	async list(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, listMedicationsQuerySchema);
		const { items, pagination } = await this.service.list(query);
		return ok(items, { pagination });
	}

	async get(id: string): Promise<NextResponse> {
		return ok(await this.service.getById(id));
	}

	async create(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, createMedicationSchema);
		return created(await this.service.create(input));
	}

	async update(request: Request, id: string): Promise<NextResponse> {
		const input = await parseBody(request, updateMedicationSchema);
		return ok(await this.service.update(id, input));
	}

	async remove(id: string): Promise<NextResponse> {
		await this.service.remove(id);
		return noContent();
	}
}
