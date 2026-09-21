import { firestore } from '@/app/api/_shared/firebase';
import { SPECIES_CATALOG } from '../catalog/species.catalog';
import type { Seeder } from '../seeder';
import { slug } from '../slug';

export const speciesSeeder: Seeder = {
	name: 'species',
	async run() {
		const collection = firestore().collection('species');
		const batch = firestore().batch();
		for (const name of SPECIES_CATALOG) {
			batch.set(collection.doc(slug(name)), { name }, { merge: true });
		}
		await batch.commit();
	},
};
