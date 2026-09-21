import type { ApiPagination, ApiResponse } from '@/types/api.type';
import * as Sentry from '@sentry/nextjs';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { toErrorBody } from '../errors/error-response';

type OkOptions = { status?: number; pagination?: ApiPagination };

type ApiErrorResponse = Pick<ApiResponse, 'statusCode' | 'message'> & {
	errors?: Record<string, string[]>;
};

/** Success envelope. `pagination` is attached only when provided. */
export function ok<T>(data: T, options: OkOptions = {}): NextResponse {
	const status = options.status ?? StatusCodes.OK;
	const body: ApiResponse<T> = {
		statusCode: status,
		message: 'OK',
		data,
		...(options.pagination ? { pagination: options.pagination } : {}),
	};
	return NextResponse.json(body, { status });
}

export function created<T>(data: T): NextResponse {
	return ok(data, { status: StatusCodes.CREATED });
}

export function noContent(): NextResponse {
	return new NextResponse(null, { status: StatusCodes.NO_CONTENT });
}

/**
 * Error envelope. Any thrown value is normalized by {@link toErrorBody}; 5xx is
 * reported to Sentry (already wired via `instrumentation.ts`).
 */
export function failure(error: unknown): NextResponse {
	const { statusCode, message, errors } = toErrorBody(error);
	if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
		if (process.env.NODE_ENV === 'development') console.error(error);
		else Sentry.captureException(error);
	}
	const body: ApiErrorResponse = {
		statusCode,
		message,
		...(errors ? { errors } : {}),
	};
	return NextResponse.json(body, { status: statusCode });
}
