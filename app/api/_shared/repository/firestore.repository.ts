import type {
	CollectionReference,
	DocumentData,
	Query,
	UpdateData,
} from 'firebase-admin/firestore';
import { mapFirebaseError } from '../errors/firebase-error';
import { firestore } from '../firebase';
import type { FirestoreCrudRepository } from './repository.contract';
import type {
	FirestoreOrderBy,
	FirestoreQueryOptions,
	FirestoreWhere,
	WithId,
} from './repository.types';

/**
 * Generic server-only base class for a Firestore collection. Subclasses pass the
 * collection path and expose domain-specific methods; every operation is
 * normalized through {@link mapFirebaseError}.
 *
 * Import only from Node.js runtime route handlers, Server Components, or Server
 * Actions — never from `proxy.ts` (middleware/edge) or client code.
 */
export abstract class FirestoreRepository<
	T extends DocumentData,
> implements FirestoreCrudRepository<T> {
	protected readonly collectionPath: string;

	protected constructor(collectionPath: string) {
		this.collectionPath = collectionPath;
	}

	protected get collection(): CollectionReference<T> {
		return firestore().collection(
			this.collectionPath
		) as CollectionReference<T>;
	}

	async findById(id: string): Promise<WithId<T> | null> {
		try {
			const snapshot = await this.collection.doc(id).get();
			return snapshot.exists
				? this.toModel(snapshot.id, snapshot.data())
				: null;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async findMany(options?: FirestoreQueryOptions<T>): Promise<WithId<T>[]> {
		try {
			const snapshot = await this.buildQuery(options).get();
			return snapshot.docs.map((doc) => this.toModel(doc.id, doc.data()));
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async findOne(options?: FirestoreQueryOptions<T>): Promise<WithId<T> | null> {
		const [result] = await this.findMany({ ...options, limit: 1 });
		return result ?? null;
	}

	async count(options?: FirestoreQueryOptions<T>): Promise<number> {
		try {
			const snapshot = await this.buildQuery(options).count().get();
			return snapshot.data().count;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async exists(id: string): Promise<boolean> {
		try {
			const snapshot = await this.collection.doc(id).get();
			return snapshot.exists;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async create(data: T, id?: string): Promise<WithId<T>> {
		try {
			const ref = id ? this.collection.doc(id) : this.collection.doc();
			await ref.set(data);
			return { ...data, id: ref.id };
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async update(id: string, data: UpdateData<T>): Promise<void> {
		try {
			await this.collection.doc(id).update(data);
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await this.collection.doc(id).delete();
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	private toModel(id: string, data: T | undefined): WithId<T> {
		return { ...(data as T), id };
	}

	private buildQuery(options?: FirestoreQueryOptions<T>): Query<T> {
		let query: Query<T> = this.collection;
		if (!options) return query;

		for (const clause of options.where ?? [])
			query = this.applyWhere(query, clause);
		for (const order of options.orderBy ?? [])
			query = this.applyOrderBy(query, order);
		if (options.startAfter) query = query.startAfter(...options.startAfter);
		if (typeof options.offset === 'number')
			query = query.offset(options.offset);
		if (typeof options.limit === 'number') query = query.limit(options.limit);

		return query;
	}

	private applyWhere(query: Query<T>, clause: FirestoreWhere<T>): Query<T> {
		return query.where(clause.field, clause.op, clause.value);
	}

	private applyOrderBy(query: Query<T>, order: FirestoreOrderBy<T>): Query<T> {
		return query.orderBy(order.field, order.direction ?? 'asc');
	}
}
