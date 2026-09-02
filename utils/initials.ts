export function getInitials(s: string) {
	// Take first char of first two words; fallback to first 2 letters
	const parts = s.trim().split(/\s+/);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	return s.slice(0, 2).toUpperCase();
}
