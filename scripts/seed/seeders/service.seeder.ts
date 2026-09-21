import { firestore } from '@/app/api/_shared/firebase';
import { SERVICE_CATALOG } from '../catalog/service.catalog';
import type { Seeder } from '../seeder';
import { slug } from '../slug';

/** Fixed authoring timestamp so re-running the seeder stays idempotent —
 * `createdAt` (required by `service.schema.ts`) doesn't drift to "now" on
 * every `pnpm db:seed`. */
const SEEDED_AT = '2026-01-01T00:00:00.000Z';

export const serviceSeeder: Seeder = {
	name: 'services',
	async run() {
		const collection = firestore().collection('services');
		const batch = firestore().batch();
		for (const service of SERVICE_CATALOG) {
			batch.set(
				collection.doc(slug(service.name)),
				{ ...service, createdAt: SEEDED_AT },
				{ merge: true }
			);
		}
		await batch.commit();
	},
};
