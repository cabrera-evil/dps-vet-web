import { isHttpError } from 'http-errors';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

export type ErrorBody = {
	statusCode: number;
	message: string;
	errors?: Record<string, string[]>;
};

/**
 * Normalizes any thrown value into the response body used by `failure()`:
 * `http-errors` instances keep their status (message hidden for non-exposed
 * 5xx), Zod errors become `400` with field errors, everything else is `500`.
 */
export function toErrorBody(error: unknown): ErrorBody {
	if (error instanceof ZodError) {
		return {
			statusCode: StatusCodes.BAD_REQUEST,
			message: 'Validation failed',
			errors: error.flatten().fieldErrors as Record<string, string[]>,
		};
	}

	if (isHttpError(error)) {
		return {
			statusCode: error.statusCode,
			message: error.expose ? error.message : getReasonPhrase(error.statusCode),
		};
	}

	return {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
	};
}
