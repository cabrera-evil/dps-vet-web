'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { useBreeds } from '@/hooks/use-breeds';
import { useGet } from '@/hooks/use-rest';
import type { CatalogEntry } from '@/types/catalog.type';
import { useFormContext, useWatch } from 'react-hook-form';

export type SpeciesBreedValues = { species: string; breed: string };

/**
 * Species + breed selects for a pet form (inside a `FormProvider`). The breed
 * only offers the chosen species' breeds: it is disabled until a species is
 * picked and hidden for species that have no breeds in the catalog.
 */
export function PetSpeciesBreedFields() {
	const { control, setValue } = useFormContext<SpeciesBreedValues>();
	const species = useWatch({ control, name: 'species' });
	const { data: speciesList, isLoading: isLoadingSpecies } = useGet<
		CatalogEntry[]
	>({ path: '/species', params: { pageSize: 100 } });
	const { breeds, isLoading: isLoadingBreeds } = useBreeds(species);
	const showBreed = !species || isLoadingBreeds || breeds.length > 0;

	return (
		<div className={showBreed ? 'grid grid-cols-2 gap-4' : 'grid gap-4'}>
			<ClinicalSelectField
				control={control}
				name="species"
				id="pet-species"
				label="Especie"
				options={(speciesList ?? []).map((entry) => ({
					value: entry.name,
					label: entry.name,
				}))}
				placeholder="Selecciona la especie"
				disabled={isLoadingSpecies}
				onValueChange={() => setValue('breed', '')}
			/>
			{showBreed && (
				<ClinicalSelectField
					control={control}
					name="breed"
					id="pet-breed"
					label="Raza"
					options={breeds.map((entry) => ({
						value: entry.name,
						label: entry.name,
					}))}
					placeholder={
						species ? 'Selecciona la raza' : 'Primero elige la especie'
					}
					disabled={!species || isLoadingBreeds}
				/>
			)}
		</div>
	);
}
