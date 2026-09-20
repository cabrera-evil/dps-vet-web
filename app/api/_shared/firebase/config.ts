import type { FirebaseAdminConfig } from './firebase.types';

const REQUIRED_ENV_KEYS = [
	'FIREBASE_PROJECT_ID',
	'FIREBASE_CLIENT_EMAIL',
	'FIREBASE_PRIVATE_KEY',
	'FIREBASE_STORAGE_BUCKET',
	'FIREBASE_DATABASE_URL',
] as const;

let cachedConfig: FirebaseAdminConfig | null = null;

/**
 * Reads and validates the Firebase Admin service-account configuration from the
 * environment. Throws once, with every missing key listed, if configuration is
 * incomplete. The private key is normalized so escaped `\n` sequences (the form
 * used in `.env` files and deployment secrets) become real newlines.
 */
export function getFirebaseAdminConfig(): FirebaseAdminConfig {
	if (cachedConfig) return cachedConfig;

	const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
	if (missing.length > 0)
		throw new Error(
			`Missing required Firebase Admin environment variables: ${missing.join(', ')}`
		);

	cachedConfig = {
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		databaseURL: process.env.FIREBASE_DATABASE_URL,
	};

	return cachedConfig;
}
