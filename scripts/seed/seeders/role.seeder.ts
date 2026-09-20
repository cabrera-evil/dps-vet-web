import { firestore } from '@/app/api/_shared/firebase';
import { ROLE_CATALOG } from '../catalog/role.catalog';
import type { Seeder } from '../seeder';

export const roleSeeder: Seeder = {
	name: 'roles',
	async run() {
		const collection = firestore().collection('roles');
		const batch = firestore().batch();
		for (const role of ROLE_CATALOG) {
			batch.set(collection.doc(role.name), role, { merge: true });
		}
		await batch.commit();
	},
};
