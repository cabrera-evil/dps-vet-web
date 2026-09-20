import { parseSearchParams } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	appointmentsReportQuerySchema,
	inventoryTurnoverQuerySchema,
	popularServicesQuerySchema,
} from './report.schema';
import type { ReportService } from './report.service';

/**
 * Translates HTTP <-> {@link ReportService}. Owns request
 * parsing/validation and response shaping only — no aggregation logic.
 */
export class ReportController {
	constructor(private readonly service: ReportService) {}

	async appointments(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, appointmentsReportQuerySchema);
		return ok(await this.service.appointmentsReport(query));
	}

	async popularServices(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, popularServicesQuerySchema);
		return ok(await this.service.popularServices(query));
	}

	async inventoryTurnover(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, inventoryTurnoverQuerySchema);
		return ok(await this.service.inventoryTurnover(query));
	}
}
