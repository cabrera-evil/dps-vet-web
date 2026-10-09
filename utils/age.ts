export function getAgeLabel(birthDate: string) {
	const ageMs = Date.now() - new Date(birthDate).getTime();
	const years = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
	return years > 0 ? `${years} años` : 'Menor a 1 año';
}
