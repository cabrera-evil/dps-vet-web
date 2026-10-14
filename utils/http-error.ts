import { isAxiosError } from 'axios';

export function isNotFoundError(error: unknown): boolean {
	return isAxiosError(error) && error.response?.status === 404;
}

const VALIDATION_FAILED = 'Validation failed';

const VALIDATION_ERROR_MESSAGE = 'Revisa los datos ingresados.';

const CONNECTION_ERROR_MESSAGE =
	'No se pudo conectar con el servidor. Lo que escribiste se conserva.';

/** The server's message when it answered; a neutral one when the request never got a response. */
export function getErrorMessage(error: unknown): string {
	if (isAxiosError<{ message?: string }>(error)) {
		const message = error.response?.data?.message;
		if (!error.response) return CONNECTION_ERROR_MESSAGE;
		return message === VALIDATION_FAILED
			? VALIDATION_ERROR_MESSAGE
			: message || CONNECTION_ERROR_MESSAGE;
	}
	return error instanceof Error ? error.message : CONNECTION_ERROR_MESSAGE;
}
