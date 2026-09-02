import createHttpError, { HttpError, isHttpError } from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import {
	FIREBASE_STATUS_BY_CODE,
	normalizeFirebaseCode,
} from './firebase-status-map';

/**
 * Normalizes any thrown value from a Firebase Admin call into an `http-errors`
 * error. Already-normalized errors pass through untouched. The original Firebase
 * `code` and error are attached as `code` / `cause`.
 */
export function mapFirebaseError(error: unknown): HttpError {
	if (isHttpError(error)) return error;

	const candidate = (error ?? {}) as {
		code?: string | number;
		message?: string;
	};
	const message =
		candidate.message ||
		(error instanceof Error ? error.message : 'Unknown Firebase error');
	const isStringCode = typeof candidate.code === 'string';

	return createHttpError(
		isStringCode
			? (FIREBASE_STATUS_BY_CODE[
					normalizeFirebaseCode(candidate.code as string)
				] ?? StatusCodes.INTERNAL_SERVER_ERROR)
			: StatusCodes.INTERNAL_SERVER_ERROR,
		message,
		{ code: isStringCode ? candidate.code : 'internal', cause: error }
	);
}
