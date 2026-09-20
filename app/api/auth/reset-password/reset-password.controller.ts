import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { resetPasswordSchema } from './reset-password.schema';
import type { ResetPasswordService } from './reset-password.service';

/**
 * Translates HTTP <-> {@link ResetPasswordService}. Owns request
 * parsing/validation and response shaping only — no Firebase Auth types.
 */
export class ResetPasswordController {
	constructor(private readonly service: ResetPasswordService) {}

	async reset(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, resetPasswordSchema);
		await this.service.reset(input);
		return ok({ reset: true });
	}
}
