import { FirebaseAdminService } from './admin.service';

/**
 * Functional accessors over the {@link FirebaseAdminService} singleton, mirroring
 * `lib/rest.ts`. Each is a function so the Admin SDK is only initialized on first
 * call, not at import time.
 */
export const firestore = () =>
	FirebaseAdminService.getInstance().getFirestore();

export const auth = () => FirebaseAdminService.getInstance().getAuth();

export const storage = () => FirebaseAdminService.getInstance().getStorage();

export const database = () => FirebaseAdminService.getInstance().getDatabase();
