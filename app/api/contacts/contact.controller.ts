import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, noContent, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createContactSchema,
	listContactsQuerySchema,
	updateContactSchema,
} from './contact.schema';
import type { ContactService } from './contact.service';

/**
 * Translates HTTP <-> {@link ContactService}. Owns request parsing/validation and
 * response shaping only — no domain rules, no Firestore types.
 */
export class ContactController {
	constructor(private readonly service: ContactService) {}

	async list(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, listContactsQuerySchema);
		const { items, pagination } = await this.service.list(query);
		return ok(items, { pagination });
	}

	async get(id: string): Promise<NextResponse> {
		return ok(await this.service.getById(id));
	}

	async create(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, createContactSchema);
		return created(await this.service.submit(input));
	}

	async update(request: Request, id: string): Promise<NextResponse> {
		const input = await parseBody(request, updateContactSchema);
		return ok(await this.service.updateStatus(id, input));
	}

	async remove(id: string): Promise<NextResponse> {
		await this.service.remove(id);
		return noContent();
	}
}
