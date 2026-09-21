/** Source of truth for the `breeds` Firestore collection — feeds the pet
 * registration form's breed select. Not scoped per species; kept as a flat,
 * commonly-seen list plus a catch-all `Otro`. */
export const BREED_CATALOG: string[] = [
	'Criollo/Mestizo',
	'Labrador Retriever',
	'Pastor Alemán',
	'Bulldog Francés',
	'Poodle',
	'Chihuahua',
	'Schnauzer',
	'Golden Retriever',
	'Persa',
	'Siamés',
	'Angora',
	'Otro',
];
