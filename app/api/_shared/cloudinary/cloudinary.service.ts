import createHttpError from 'http-errors';
import { createHash } from 'node:crypto';

const API_BASE = 'https://api.cloudinary.com/v1_1';
const TIMEOUT_MS = 15_000;
/** Only ids shaped like the ones this app uploads may ever be destroyed. */
const OWN_PUBLIC_ID = /^pets\/[A-Za-z0-9_-]+\/photo-\d+$/;

/** Fails fast with a controlled 500 naming only the variable, never its value. */
function requireEnv(
	key: 'CLOUDINARY_CLOUD_NAME' | 'CLOUDINARY_API_KEY' | 'CLOUDINARY_API_SECRET'
) {
	const value = process.env[key]?.trim();
	if (!value)
		throw createHttpError(
			500,
			`Missing required environment variable: ${key}`,
			{ expose: true }
		);
	return value;
}

/**
 * Cloudinary signature: hex SHA-1 of the signed params sorted by name and
 * joined as `k=v&k2=v2`, immediately followed by the API secret. `file`,
 * `api_key`, `cloud_name`, `resource_type` and `signature` are never signed.
 */
export function signParams(
	params: Record<string, string>,
	apiSecret: string
): string {
	const toSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');
	return createHash('sha1')
		.update(toSign + apiSecret)
		.digest('hex');
}

/** Signs `params`, POSTs them to a Cloudinary image endpoint and returns the parsed JSON. */
async function post(
	action: 'upload' | 'destroy',
	params: Record<string, string>,
	file?: Blob
): Promise<Record<string, unknown>> {
	const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME');
	const apiKey = requireEnv('CLOUDINARY_API_KEY');
	const apiSecret = requireEnv('CLOUDINARY_API_SECRET');

	const signed = {
		...params,
		timestamp: String(Math.floor(Date.now() / 1000)),
	};
	const body = new FormData();
	for (const [key, value] of Object.entries(signed)) body.set(key, value);
	body.set('api_key', apiKey);
	body.set('signature', signParams(signed, apiSecret));
	if (file) body.set('file', file, 'photo.jpg');

	// Never forward Cloudinary's response or the underlying error: only a generic message.
	const unavailable = () =>
		new createHttpError.BadGateway('Image storage unavailable');
	try {
		const response = await fetch(
			`${API_BASE}/${encodeURIComponent(cloudName)}/image/${action}`,
			{
				method: 'POST',
				body,
				signal: AbortSignal.timeout(TIMEOUT_MS),
			}
		);
		if (!response.ok) throw unavailable();
		return (await response.json()) as Record<string, unknown>;
	} catch {
		throw unavailable();
	}
}

/** Uploads a JPEG under `publicId` and returns its permanent HTTPS URL. */
export async function uploadImage(
	buffer: Buffer,
	publicId: string
): Promise<string> {
	const data = await post(
		'upload',
		{ public_id: publicId },
		new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' })
	);
	const url = data.secure_url;
	if (typeof url !== 'string' || !url.startsWith('https://'))
		throw new createHttpError.BadGateway('Image storage unavailable');
	return url;
}

/** Deletes an image; an already-missing one is not an error. */
export async function destroyImage(publicId: string): Promise<void> {
	await post('destroy', { public_id: publicId });
}

/**
 * Derives the public id of one of our own uploads from its delivery URL
 * (`https://res.cloudinary.com/{cloud}/image/upload/[v123/]pets/{id}/photo-{ts}.jpg`).
 * Returns `null` for anything else (other host, other cloud, other path), so a
 * crafted `photoUrl` can never make us delete an arbitrary asset.
 */
export function publicIdFromUrl(
	photoUrl: string,
	cloudName = requireEnv('CLOUDINARY_CLOUD_NAME')
): string | null {
	let url: URL;
	try {
		url = new URL(photoUrl);
	} catch {
		return null;
	}
	const prefix = `/${cloudName}/image/upload/`;
	if (
		url.protocol !== 'https:' ||
		url.host !== 'res.cloudinary.com' ||
		!url.pathname.startsWith(prefix)
	)
		return null;
	const id = url.pathname
		.slice(prefix.length)
		.replace(/^v\d+\//, '')
		.replace(/\.[A-Za-z0-9]+$/, '');
	return OWN_PUBLIC_ID.test(id) ? id : null;
}
