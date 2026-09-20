import { parseBody } from '@/app/api/_shared/http/request';
import { ok } from '@/app/api/_shared/http/response';
import type { NextResponse } from 'next/server';
import { loginSchema } from './login.schema';
import type { LoginService } from './login.service';

/**
 * Translates HTTP <-> {@link LoginService}. Owns request parsing/validation
 * and response shaping only — no Firebase Auth types.
 */
export class LoginController {
	constructor(private readonly service: LoginService) {}

	async login(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, loginSchema);
		return ok(await this.service.login(input));
	}
}
