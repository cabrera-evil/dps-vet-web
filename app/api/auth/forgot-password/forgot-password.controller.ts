import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { forgotPasswordSchema } from './forgot-password.schema';
import type { ForgotPasswordService } from './forgot-password.service';

/**
 * Translates HTTP <-> {@link ForgotPasswordService}. Owns request
 * parsing/validation and response shaping only — no Firebase Auth types.
 */
export class ForgotPasswordController {
	constructor(private readonly service: ForgotPasswordService) {}

	async requestReset(request: Request): Promise<NextResponse> {
		const { email } = await parseBody(request, forgotPasswordSchema);
		await this.service.requestReset(email);
		return ok({ requested: true });
	}
}
