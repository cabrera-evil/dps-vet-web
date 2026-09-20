import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, noContent, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createServiceSchema,
	listServicesQuerySchema,
	updateServiceSchema,
} from './service.schema';
import type { ServiceCatalogService } from './service.service';

/**
 * Translates HTTP <-> {@link ServiceCatalogService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class ServiceController {
	constructor(private readonly service: ServiceCatalogService) {}

	/**
	 * This route is public (see `route.ts`) — always forces `active: true`
	 * regardless of what the caller sends, so an unauthenticated visitor can
	 * never enumerate inactive/draft catalog entries.
	 */
	async list(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, listServicesQuerySchema);
		const { items, pagination } = await this.service.list({
			...query,
			active: true,
		});
		return ok(items, { pagination });
	}

	async get(id: string): Promise<NextResponse> {
		return ok(await this.service.getById(id));
	}

	async create(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, createServiceSchema);
		return created(await this.service.create(input));
	}

	async update(request: Request, id: string): Promise<NextResponse> {
		const input = await parseBody(request, updateServiceSchema);
		return ok(await this.service.update(id, input));
	}

	async remove(id: string): Promise<NextResponse> {
		await this.service.remove(id);
		return noContent();
	}
}
