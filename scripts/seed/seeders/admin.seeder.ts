import { auth, firestore } from '@/app/api/_shared/firebase';
import { RoleName } from '@/constants/roles';
import { ROLE_CATALOG } from '../catalog/role.catalog';
import type { Seeder } from '../seeder';

const REQUIRED_ENV_KEYS = [
	'ADMIN_EMAIL',
	'ADMIN_PASSWORD',
	'ADMIN_NAME',
	'ADMIN_PHONE',
] as const;

/**
 * Seeds the initial administrator account, read entirely from env so no
 * credentials are hardcoded. Idempotent: if a Firebase Auth user with
 * `ADMIN_EMAIL` already exists, only its `permissions` claim and Firestore
 * profile are refreshed (its password is left untouched). Must run after
 * `roleSeeder` — it reads the `ADMINISTRADOR` role's permissions straight
 * from the same catalog `roleSeeder` writes to Firestore, rather than
 * reading Firestore back, to avoid a read-after-write race.
 */
export const adminSeeder: Seeder = {
	name: 'admin user',
	async run() {
		const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
		if (missing.length > 0) {
			process.stdout.write(
				`  Skipping admin user: missing env vars ${missing.join(', ')}\n`
			);
			return;
		}

		const email = process.env.ADMIN_EMAIL!;
		const password = process.env.ADMIN_PASSWORD!;
		const name = process.env.ADMIN_NAME!;
		const phone = process.env.ADMIN_PHONE!;

		const permissions =
			ROLE_CATALOG.find((role) => role.name === RoleName.ADMINISTRADOR)
				?.permissions ?? [];

		let uid: string;
		try {
			uid = (await auth().getUserByEmail(email)).uid;
		} catch {
			const authUser = await auth().createUser({
				email,
				password,
				displayName: name,
			});
			uid = authUser.uid;
		}

		await auth().setCustomUserClaims(uid, { permissions });

		const userRef = firestore().collection('users').doc(uid);
		const existingDoc = await userRef.get();
		await userRef.set(
			{
				uid,
				name,
				email,
				phone,
				role: RoleName.ADMINISTRADOR,
				...(existingDoc.exists ? {} : { createdAt: new Date().toISOString() }),
			},
			{ merge: true }
		);
	},
};
