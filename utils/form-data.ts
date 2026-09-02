/**
 * Append arbitrary values into FormData with sensible defaults.
 * - File/Blob => raw append
 * - Array     => repeated field (or brackets-style if configured)
 * - Date      => ISO string
 * - Object    => JSON string
 * - Primitives=> stringified
 */
export function appendToFormData(
	fd: FormData,
	key: string,
	value: unknown,
	opts: { arrayBrackets?: boolean } = {}
) {
	if (value === null || value === undefined) return;

	if (value instanceof Blob || value instanceof File) {
		fd.append(key, value);
		return;
	}
	if (Array.isArray(value)) {
		const field = opts.arrayBrackets ? `${key}[]` : key;
		for (const item of value) appendToFormData(fd, field, item, opts);
		return;
	}
	if (value instanceof Date) {
		fd.append(key, value.toISOString());
		return;
	}
	if (typeof value === 'object') {
		fd.append(key, JSON.stringify(value)); // keep nested objects as JSON
		return;
	}
	fd.append(key, String(value));
}
