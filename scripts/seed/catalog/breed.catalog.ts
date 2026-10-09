export interface BreedCatalogEntry {
	name: string;
	species: string;
}

/** Source of truth for the `breeds` Firestore collection — feeds the pet
 * registration form's breed select, which only offers the breeds of the chosen
 * species. A species without entries here (birds, rabbits, ...) has no breed
 * field. `species` must match a name in `species.catalog.ts`. */
export const BREED_CATALOG: BreedCatalogEntry[] = [
	{ species: 'Perro', name: 'Criollo/Mestizo' },
	{ species: 'Perro', name: 'Labrador Retriever' },
	{ species: 'Perro', name: 'Pastor Alemán' },
	{ species: 'Perro', name: 'Bulldog Francés' },
	{ species: 'Perro', name: 'Poodle' },
	{ species: 'Perro', name: 'Chihuahua' },
	{ species: 'Perro', name: 'Schnauzer' },
	{ species: 'Perro', name: 'Golden Retriever' },
	{ species: 'Perro', name: 'Otro' },
	{ species: 'Gato', name: 'Criollo/Mestizo' },
	{ species: 'Gato', name: 'Persa' },
	{ species: 'Gato', name: 'Siamés' },
	{ species: 'Gato', name: 'Angora' },
	{ species: 'Gato', name: 'Otro' },
];
