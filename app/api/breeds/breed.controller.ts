import { parseSearchParams } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import { listBreedsQuerySchema } from './breed.schema';
import type { BreedService } from './breed.service';

export class BreedController {
	constructor(private readonly service: BreedService) {}

	async list(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, listBreedsQuerySchema);
		return ok(await this.service.list(query));
	}
}
