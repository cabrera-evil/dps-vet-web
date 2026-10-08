import { firestore } from '@/app/api/_shared/firebase';
import { MEDICATION_CATALOG } from '../catalog/medication.catalog';
import type { Seeder } from '../seeder';
import { slug } from '../slug';

/** Creates only missing documents — unlike catalog seeders that merge, `stock`
 * is live data, so re-running must never reset quantities edited since. */
export const medicationSeeder: Seeder = {
	name: 'medications',
	async run() {
		const collection = firestore().collection('medications');
		const refs = MEDICATION_CATALOG.map((medication) =>
			collection.doc(slug(medication.name))
		);
		const snapshots = await firestore().getAll(...refs);
		const batch = firestore().batch();
		snapshots.forEach((snapshot, index) => {
			if (!snapshot.exists) batch.set(refs[index], MEDICATION_CATALOG[index]);
		});
		await batch.commit();
	},
};
