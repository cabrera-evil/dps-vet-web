export interface CatalogEntry {
	id: string;
	name: string;
}

export interface BreedEntry extends CatalogEntry {
	species: string;
}
