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

const MAX_FILE_BYTES = 5 * 1024 * 1024;
/** File limit plus room for the multipart envelope. */
const MAX_BODY_BYTES = MAX_FILE_BYTES + 512 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reads one image from a multipart field. A missing field, a MIME type outside
 * jpeg/png/webp or a file over 5 MB raises a `400`. The MIME type is only the
 * client's claim: callers must still decode the bytes.
 */
export async function parseFormImage(
	request: Request,
	field: string
): Promise<Buffer> {
	// ponytail: only the declared length is checked; a chunked body without
	// content-length is still buffered whole. Byte-counting stream if abuse matters
	// (a TransformStream over request.body crashed Node 24 when it cut the body).
	if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES)
		throw new createHttpError.PayloadTooLarge('Image must be 5 MB or smaller');
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		throw new createHttpError.BadRequest('Invalid multipart body');
	}
	const file = form.get(field);
	if (!(file instanceof File))
		throw new createHttpError.BadRequest(`${field} file is required`);
	if (!IMAGE_TYPES.includes(file.type))
		throw new createHttpError.BadRequest('Only JPEG, PNG or WebP images');
	if (file.size > MAX_FILE_BYTES)
		throw new createHttpError.BadRequest('Image must be 5 MB or smaller');
	return Buffer.from(await file.arrayBuffer());
}

/** Parses and validates the query string. Use `z.coerce.*` for numeric params. */
export function parseSearchParams<S extends z.ZodTypeAny>(
	request: NextRequest,
	schema: S
): z.infer<S> {
	const params = Object.fromEntries(request.nextUrl.searchParams.entries());
	return schema.parse(params);
}
