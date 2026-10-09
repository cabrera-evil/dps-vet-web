import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { firestore } from '@/app/api/_shared/firebase';
import { FirestoreRepository } from '@/app/api/_shared/repository/firestore.repository';
import type { WithId } from '@/app/api/_shared/repository/repository.types';
import { MEASUREMENTS_COLLECTION } from '@/app/api/consultations/clinical-measurement.repository';
import { MEASUREMENT_SOURCES } from '@/app/api/consultations/clinical-measurement.schema';
import { ClinicalMeasurementType } from '@/constants/enum';
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
}
