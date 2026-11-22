import * as Sentry from '@sentry/nextjs';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import createHttpError from 'http-errors';

/** Folder holding everything this app stores; the Cloudinary account is shared. */
export const CLOUDINARY_HOME = 'dps-vet';
/**
 * Only ids shaped like the ones this app uploads may ever be destroyed. The
 * second shape exists only to clean up pre-`dps-vet` uploads at the account
 * root and can be removed once those photos are re-uploaded.
 */
const OWN_PUBLIC_ID = new RegExp(
	`^(?:${CLOUDINARY_HOME}/)?pets/[A-Za-z0-9_-]+/photo-\\d+$`
);

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

/** Cloudinary's own 60 s default would outlive the request, so cap it. */
const TIMEOUT_MS = 15_000;
const MAX_LOG_LENGTH = 300;

/**
 * Logs only `http_code`, `name` and `message` of an SDK error, with the API
 * secret, the API key and the signature's string-to-sign redacted, and never
 * hands the raw error (or Cloudinary's body) to the client.
 */
function logFailure(
	operation: 'upload' | 'destroy',
	error: unknown,
	secrets: string[]
) {
	// The SDK rejects either with the error itself or with `{ error }`.
	const { http_code, name, message } = ((error as { error?: unknown })?.error ??
		error ??
		{}) as Record<string, unknown>;
	let line = `Cloudinary ${operation} failed: http_code=${http_code ?? 'n/a'} name=${name ?? 'n/a'} message=${message ?? 'n/a'}`;
	line = line.replace(/string to sign[\s\S]*$/i, '[redacted]');
	for (const secret of secrets) line = line.split(secret).join('[redacted]');
	line = line.slice(0, MAX_LOG_LENGTH);
	// eslint-disable-next-line no-console -- server log so the cause is visible beyond Sentry
	console.error(line);
	Sentry.captureException(new Error(line));
}

/**
 * Configures the SDK explicitly from our three variables (so a stray
 * `CLOUDINARY_URL` cannot override them), runs `call`, and turns any failure
 * into a generic 502 after logging its safe details.
 */
async function run<T>(
	operation: 'upload' | 'destroy',
	call: () => Promise<T>
): Promise<T> {
	const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME');
	const apiKey = requireEnv('CLOUDINARY_API_KEY');
	const apiSecret = requireEnv('CLOUDINARY_API_SECRET');
	try {
		cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
			secure: true,
		});
		return await call();
	} catch (error) {
		logFailure(operation, error, [apiSecret, apiKey]);
		throw new createHttpError.BadGateway('Image storage unavailable');
	}
}

/** Uploads a JPEG under `publicId` and returns its permanent HTTPS URL. */
export function uploadImage(buffer: Buffer, publicId: string): Promise<string> {
	return run('upload', async () => {
		const result = await new Promise<UploadApiResponse>((resolve, reject) =>
			cloudinary.uploader
				.upload_stream(
					{
						public_id: publicId,
						// Dynamic folder mode lists assets by folder, not by public id path.
						asset_folder: publicId.slice(0, publicId.lastIndexOf('/')),
						resource_type: 'image',
						timeout: TIMEOUT_MS,
					},
					(error, uploaded) =>
						uploaded
							? resolve(uploaded)
							: reject(error ?? new Error('No result'))
				)
				.end(buffer)
		);
		if (!result.secure_url?.startsWith('https://'))
			throw new Error('Upload result has no https secure_url');
		return result.secure_url;
	});
}

/** Deletes an image; an already-missing one is not an error. */
export function destroyImage(publicId: string): Promise<void> {
	return run('destroy', async () => {
		// `timeout` works at runtime but is missing from the SDK's destroy typings.
		const options = {
			resource_type: 'image',
			invalidate: true,
			timeout: TIMEOUT_MS,
		} as const;
		const { result } = await cloudinary.uploader.destroy(publicId, options);
		if (result !== 'ok' && result !== 'not found')
			throw new Error(`Unexpected destroy result: ${result}`);
	});
}

/**
 * Derives the public id of one of our own uploads from its delivery URL
 * (`https://res.cloudinary.com/{cloud}/image/upload/[v123/]dps-vet/pets/{id}/photo-{ts}.jpg`).
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
