import { parseBody, parseSearchParams } from '@/app/api/_shared/http/request';
import { created, ok } from '@/app/api/_shared/http/response';
import type { NextRequest, NextResponse } from 'next/server';
import {
	createUserSchema,
	listUsersQuerySchema,
	updateUserRoleSchema,
} from './user.schema';
import type { UserService } from './user.service';

/**
 * Translates HTTP <-> {@link UserService}. Owns request parsing/validation and
 * response shaping only — no domain rules, no Firestore/Firebase Auth types.
 */
export class UserController {
	constructor(private readonly service: UserService) {}

	async list(request: NextRequest): Promise<NextResponse> {
		const query = parseSearchParams(request, listUsersQuerySchema);
		const { items, pagination } = await this.service.list(query);
		return ok(items, { pagination });
	}

	async get(id: string): Promise<NextResponse> {
		return ok(await this.service.getById(id));
	}

	async register(request: Request): Promise<NextResponse> {
		const input = await parseBody(request, createUserSchema);
		return created(await this.service.register(input));
	}

	async updateRole(request: Request, id: string): Promise<NextResponse> {
		const input = await parseBody(request, updateUserRoleSchema);
		return ok(await this.service.updateRole(id, input));
	}
}
