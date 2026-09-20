import createHttpError from 'http-errors';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Parses and validates a JSON request body. A malformed body raises a `400`
 * `http-errors`; a schema mismatch raises `ZodError`, which the route boundary
 * also maps to a `400` with field errors.
 */
export async function parseBody<S extends z.ZodTypeAny>(
	request: Request,
	schema: S
): Promise<z.infer<S>> {
	let json: unknown;
	try {
		json = await request.json();
	} catch {
		throw new createHttpError.BadRequest('Invalid JSON body');
	}
	return schema.parse(json);
}

/** Parses and validates the query string. Use `z.coerce.*` for numeric params. */
export function parseSearchParams<S extends z.ZodTypeAny>(
	request: NextRequest,
	schema: S
): z.infer<S> {
	const params = Object.fromEntries(request.nextUrl.searchParams.entries());
	return schema.parse(params);
}
