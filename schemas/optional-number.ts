import { z } from 'zod';

/** Numeric text input that may be left empty; when filled it must be a positive number. */
export const optionalNumber = (message: string, integer = false) =>
	z.string().refine(
		(value) => {
			if (!value.trim()) return true;
			const parsed = Number(value);
			return (
				Number.isFinite(parsed) &&
				parsed > 0 &&
				(!integer || Number.isInteger(parsed))
			);
		},
		{ message }
	);
