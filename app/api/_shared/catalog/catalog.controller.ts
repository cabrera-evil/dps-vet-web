import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { CatalogService } from './catalog.service';

export class CatalogController {
	constructor(private readonly service: CatalogService) {}

	async list(): Promise<NextResponse> {
		return ok(await this.service.list());
	}
}
