import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Database, getDatabase } from 'firebase-admin/database';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getFirebaseAdminConfig } from './config';

/**
 * Server-only singleton around the Firebase Admin SDK. Initializes the Admin app
 * exactly once per process (guarding against dev/HMR double-init) and exposes
 * lazily-memoized service handles.
 *
 * Import only from Node.js runtime route handlers, Server Components, or Server
 * Actions — never from `proxy.ts` (middleware/edge) or client code.
 */
export class FirebaseAdminService {
	private static instance: FirebaseAdminService;

	private readonly app: App;
	private firestore?: Firestore;
	private auth?: Auth;
	private storage?: Storage;
	private database?: Database;

	private constructor() {
		const { projectId, clientEmail, privateKey, storageBucket, databaseURL } =
			getFirebaseAdminConfig();

		this.app = getApps().length
			? getApp()
			: initializeApp({
					credential: cert({ projectId, clientEmail, privateKey }),
					storageBucket,
					databaseURL,
				});
	}

	public static getInstance() {
		FirebaseAdminService.instance ??= new FirebaseAdminService();
		return FirebaseAdminService.instance;
	}

	public getFirestore(): Firestore {
		if (!this.firestore) {
			this.firestore = getFirestore(this.app);
			this.firestore.settings({ ignoreUndefinedProperties: true });
		}
		return this.firestore;
	}

	public getAuth(): Auth {
		this.auth ??= getAuth(this.app);
		return this.auth;
	}

	public getStorage(): Storage {
		this.storage ??= getStorage(this.app);
		return this.storage;
	}

	public getDatabase(): Database {
		this.database ??= getDatabase(this.app);
		return this.database;
	}
}
