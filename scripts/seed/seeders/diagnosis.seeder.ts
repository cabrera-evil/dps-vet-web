import { firestore } from '@/app/api/_shared/firebase';
import { DIAGNOSIS_CATALOG } from '../catalog/diagnosis.catalog';
import type { Seeder } from '../seeder';
import { slug } from '../slug';

export const diagnosisSeeder: Seeder = {
	name: 'diagnosis-catalog',
	async run() {
		const collection = firestore().collection('diagnosis-catalog');
		const batch = firestore().batch();
		for (const name of DIAGNOSIS_CATALOG) {
			batch.set(collection.doc(slug(name)), { name }, { merge: true });
		}
		await batch.commit();
	},
};
