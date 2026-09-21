import { getFirebaseAdminConfig } from '@/app/api/_shared/firebase/config';
import { v1 } from '@google-cloud/firestore';
import indexesManifest from '../../firestore.indexes.json';

type IndexFieldOrder = 'ASCENDING' | 'DESCENDING';
type IndexFieldArrayConfig = 'CONTAINS';

interface IndexFieldDefinition {
	fieldPath: string;
	order?: IndexFieldOrder;
	arrayConfig?: IndexFieldArrayConfig;
}

interface IndexDefinition {
	collectionGroup: string;
	queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
	fields: IndexFieldDefinition[];
}

/** Firestore only has one database per project on this plan/setup. */
const DATABASE_ID = '(default)';

/** Firestore's API silently appends this field to every composite index it returns. */
const IMPLICIT_TRAILING_FIELD = '__name__';

function fieldsMatch(
	existing: IndexFieldDefinition[],
	desired: IndexFieldDefinition[]
): boolean {
	const comparable =
		existing.at(-1)?.fieldPath === IMPLICIT_TRAILING_FIELD
			? existing.slice(0, -1)
			: existing;
	if (comparable.length !== desired.length) return false;
	return comparable.every(
		(field, index) =>
			field.fieldPath === desired[index].fieldPath &&
			(field.order ?? null) === (desired[index].order ?? null) &&
			(field.arrayConfig ?? null) === (desired[index].arrayConfig ?? null)
	);
}

/** gRPC status code for ALREADY_EXISTS (google-gax numeric error codes). */
const GRPC_ALREADY_EXISTS = 6;

function isAlreadyExistsError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: unknown }).code === GRPC_ALREADY_EXISTS
	);
}

function describe(definition: IndexDefinition): string {
	return definition.fields
		.map((field) => `${field.fieldPath} ${field.order ?? field.arrayConfig}`)
		.join(', ');
}

/**
 * Applies every composite index declared in `firestore.indexes.json` to the
 * live Firestore database via the Admin API's `v1.FirestoreAdminClient` —
 * the same index definitions `firebase deploy --only firestore:indexes`
 * would apply, but runnable from `pnpm db:migrate` with this app's own
 * service-account credentials, no Firebase CLI login required.
 *
 * Idempotent: an index already present (in any state — `CREATING` or
 * `ACTIVE`) with a matching scope/field list is skipped, so re-running is
 * safe. Index *creation* is a long-running operation on Google's side —
 * this only kicks it off and logs the operation name; it does not block
 * until the index finishes building (which can take minutes on a populated
 * collection). Re-run this script or check the Firebase console to confirm
 * `ACTIVE` state.
 */
export async function deployFirestoreIndexes(): Promise<void> {
	const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();
	const client = new v1.FirestoreAdminClient({
		projectId,
		credentials: { client_email: clientEmail, private_key: privateKey },
	});

	const { indexes } = indexesManifest as { indexes: IndexDefinition[] };
	const byCollectionGroup = new Map<string, IndexDefinition[]>();
	for (const definition of indexes) {
		const group = byCollectionGroup.get(definition.collectionGroup) ?? [];
		group.push(definition);
		byCollectionGroup.set(definition.collectionGroup, group);
	}

	try {
		for (const [collectionGroup, definitions] of byCollectionGroup) {
			const parent = client.collectionGroupPath(
				projectId,
				DATABASE_ID,
				collectionGroup
			);
			const [existingIndexes] = await client.listIndexes({ parent });

			for (const definition of definitions) {
				const alreadyExists = existingIndexes.some(
					(index) =>
						index.queryScope === definition.queryScope &&
						fieldsMatch(
							(index.fields ?? []) as IndexFieldDefinition[],
							definition.fields
						)
				);
				if (alreadyExists) {
					process.stdout.write(
						`  - ${collectionGroup} (${describe(definition)}): already exists, skipping.\n`
					);
					continue;
				}

				process.stdout.write(
					`  - ${collectionGroup} (${describe(definition)}): creating...\n`
				);
				try {
					const [operation] = await client.createIndex({
						parent,
						index: {
							queryScope: definition.queryScope,
							fields: definition.fields,
						},
					});
					process.stdout.write(
						`    started: ${operation.name} (building — check the Firebase console for ACTIVE status)\n`
					);
				} catch (error) {
					if (!isAlreadyExistsError(error)) throw error;
					process.stdout.write('    already exists, skipping.\n');
				}
			}
		}
	} finally {
		await client.close();
	}
}
