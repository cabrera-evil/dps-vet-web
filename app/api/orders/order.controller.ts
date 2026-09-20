import type { Identity } from '@/app/api/_shared/http/http.types';
import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import { createOrderSchema, listOrdersQuerySchema } from './order.schema';
import type { OrderService } from './order.service';

/**
 * Translates HTTP <-> {@link OrderService}. Owns request
 * parsing/validation and response shaping only — no domain rules, no
 * Firestore types.
 */
export class OrderController {
	constructor(private readonly service: OrderService) {}

	async list(request: NextRequest, identity: Identity): Promise<NextResponse> {
		const query = parseSearchParams(request, listOrdersQuerySchema);
		const { items, pagination } = await this.service.list(identity, query);
		return ok(items, { pagination });
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}

	async create(request: Request, identity: Identity): Promise<NextResponse> {
		const input = await parseBody(request, createOrderSchema);
		return created(await this.service.create(identity, input));
	}

	async cancel(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.cancel(identity, id));
	}

	async fulfill(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.fulfill(identity, id));
	}
}
