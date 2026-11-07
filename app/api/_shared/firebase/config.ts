import createHttpError from 'http-errors';
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

/** Fails fast with a controlled 500 naming only the variable, never its value. */
function requireEnv(key: 'FIREBASE_WEB_API_KEY' | 'GOOGLE_OAUTH_CLIENT_IDS') {
	const value = process.env[key]?.trim();
	if (!value)
		throw createHttpError(
			500,
			`Missing required environment variable: ${key}`,
			{ expose: true }
		);
	return value;
}

/** Firebase Web API key used by the Identity Toolkit REST helpers. */
export const getFirebaseWebApiKey = () => requireEnv('FIREBASE_WEB_API_KEY');

/** Allowed Google OAuth client IDs (`aud`), from the comma-separated env var. */
export const getGoogleOAuthClientIds = () =>
	requireEnv('GOOGLE_OAUTH_CLIENT_IDS')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
