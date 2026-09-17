import { firestore } from '@/app/api/_shared/firebase';
import { PERMISSION_CATALOG } from '../catalog/permission.catalog';
import type { Seeder } from '../seeder';

export const permissionSeeder: Seeder = {
	name: 'permissions',
	async run() {
		const collection = firestore().collection('permissions');
		const batch = firestore().batch();
		for (const permission of PERMISSION_CATALOG) {
			batch.set(collection.doc(permission.code), permission, {
				merge: true,
			});
		}
		await batch.commit();
	},
};
