import { useGet } from '@/hooks/use-rest';
import type { BreedEntry } from '@/types/catalog.type';

/**
 * Breeds of one species. A species without breeds in the catalog (birds,
 * rabbits, ...) has none, so its form hides the breed field.
 */
export function useBreeds(species: string) {
	const { data, isLoading } = useGet<BreedEntry[]>(
		{ path: '/breeds', params: { species } },
		{ enabled: !!species }
	);
	const breeds = data ?? [];

	return {
		breeds,
		isLoading: !!species && isLoading,
		/** True once the catalog confirmed this species has breeds: the form must then ask for one. */
		requiresBreed: !!species && !isLoading && breeds.length > 0,
	};
}
