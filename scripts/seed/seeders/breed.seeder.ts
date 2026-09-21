import { firestore } from '@/app/api/_shared/firebase';
import { BREED_CATALOG } from '../catalog/breed.catalog';
import type { Seeder } from '../seeder';
import { slug } from '../slug';

export const breedSeeder: Seeder = {
	name: 'breeds',
	async run() {
		const collection = firestore().collection('breeds');
		const batch = firestore().batch();
		for (const name of BREED_CATALOG) {
			batch.set(collection.doc(slug(name)), { name }, { merge: true });
		}
		await batch.commit();
	},
};
