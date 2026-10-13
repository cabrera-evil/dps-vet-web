import type { Identity } from '@/app/api/_shared/http/http.types';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import type { TreatmentPlanService } from './treatment-plan.service';

/**
 * Translates HTTP <-> {@link TreatmentPlanService}. Owns response shaping
 * only — no domain rules, no Firestore types.
 */
export class TreatmentPlanController {
	constructor(private readonly service: TreatmentPlanService) {}

	async listByPet(identity: Identity, petId: string): Promise<NextResponse> {
		return ok(await this.service.listByPet(identity, petId));
	}

	async get(identity: Identity, id: string): Promise<NextResponse> {
		return ok(await this.service.getById(identity, id));
	}
}
