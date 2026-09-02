import { StatusCodes } from 'http-status-codes';

/**
 * Firebase Admin string error codes (`"service/string-code"`, e.g.
 * `auth/user-not-found`, `permission-denied`) mapped to HTTP statuses. Codes not
 * listed here — including low-level numeric gRPC failures — fall through to 500.
 */
export const FIREBASE_STATUS_BY_CODE: Record<string, number> = {
	'not-found': StatusCodes.NOT_FOUND,
	'already-exists': StatusCodes.CONFLICT,
	'permission-denied': StatusCodes.FORBIDDEN,
	unauthenticated: StatusCodes.UNAUTHORIZED,
	'invalid-argument': StatusCodes.BAD_REQUEST,
	'failed-precondition': StatusCodes.BAD_REQUEST,
	'resource-exhausted': StatusCodes.TOO_MANY_REQUESTS,
	unavailable: StatusCodes.SERVICE_UNAVAILABLE,
	'deadline-exceeded': StatusCodes.GATEWAY_TIMEOUT,
	'auth/id-token-expired': StatusCodes.UNAUTHORIZED,
	'auth/id-token-revoked': StatusCodes.UNAUTHORIZED,
	'auth/session-cookie-expired': StatusCodes.UNAUTHORIZED,
	'auth/session-cookie-revoked': StatusCodes.UNAUTHORIZED,
	'auth/argument-error': StatusCodes.UNAUTHORIZED,
	'auth/insufficient-permission': StatusCodes.FORBIDDEN,
	'auth/user-not-found': StatusCodes.NOT_FOUND,
	'auth/email-already-exists': StatusCodes.CONFLICT,
	'auth/uid-already-exists': StatusCodes.CONFLICT,
	'auth/phone-number-already-exists': StatusCodes.CONFLICT,
};

/** Strips the `service/` prefix from a Firebase error code, keeping `auth/*`. */
export function normalizeFirebaseCode(code: string): string {
	const slashIndex = code.indexOf('/');
	if (slashIndex === -1 || code.startsWith('auth/')) return code;
	return code.slice(slashIndex + 1);
}
