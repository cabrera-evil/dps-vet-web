/** ASCII, hyphenated doc id derived from a display name — keeps catalog
 * re-seeding idempotent (`merge: true`) without a separate stored `code` field. */
export function slug(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}
