import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore, storage } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { MEASUREMENTS_COLLECTION } from '@/app/api/consultations/clinical-measurement.repository';
import { MEASUREMENT_SOURCES } from '@/app/api/consultations/clinical-measurement.schema';
import { ClinicalMeasurementType } from '@/constants/enum';
import { randomUUID } from 'node:crypto';
import type { Pet } from './pet.schema';

const COLLECTION = 'pets';

/**
 * Firestore-backed repository for the `pets` collection. Inherits the full
 * CRUD surface from {@link FirestoreRepository}; only collection-specific
 * reads and the weight-aware create are added here.
 */
export class PetRepository extends FirestoreRepository<Pet> {
	constructor() {
		super(COLLECTION);
	}

	findByOwner(ownerId: string) {
		return this.findMany({
			where: [{ field: 'ownerId', op: '==', value: ownerId }],
			orderBy: [{ field: 'createdAt', direction: 'desc' }],
		});
	}

	/** Creates the pet and its first weight entry together, so neither exists without the other. */
	async createWithWeight(
		pet: Pet,
		weightKg: number,
		createdBy: string
	): Promise<WithId<Pet>> {
		try {
			const petRef = this.collection.doc();
			const batch = firestore().batch();
			batch.set(petRef, pet);
			batch.set(firestore().collection(MEASUREMENTS_COLLECTION).doc(), {
				petId: petRef.id,
				measurementType: ClinicalMeasurementType.WEIGHT,
				numericValue: weightKg,
				unit: MEASUREMENT_SOURCES[ClinicalMeasurementType.WEIGHT].unit,
				measuredAt: pet.createdAt,
				createdAt: pet.createdAt,
				createdBy,
			});
			await batch.commit();
			return { ...pet, id: petRef.id };
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/**
	 * Stores a JPEG under a unique path (so the URL changes on every replace)
	 * and returns its permanent download-token URL; the bucket itself stays
	 * closed to clients (see `storage.rules`).
	 */
	async uploadPhoto(petId: string, jpeg: Buffer): Promise<string> {
		try {
			const bucket = storage().bucket();
			const path = `pets/${petId}/photo-${Date.now()}.jpg`;
			const token = randomUUID();
			await bucket.file(path).save(jpeg, {
				contentType: 'image/jpeg',
				metadata: { metadata: { firebaseStorageDownloadTokens: token } },
			});
			return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	/** Deletes the object behind a URL from {@link uploadPhoto}; the path is derived from the URL. */
	async deletePhoto(photoUrl: string): Promise<void> {
		const encodedPath = new URL(photoUrl).pathname.split('/o/')[1];
		if (!encodedPath) return;
		await storage()
			.bucket()
			.file(decodeURIComponent(encodedPath))
			.delete({ ignoreNotFound: true });
	}
}
