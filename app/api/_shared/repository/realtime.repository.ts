import type { Query, Reference } from 'firebase-admin/database';
import { mapFirebaseError } from '../errors/firebase-error';
import { database } from '../firebase';
import type { RealtimeQueryOptions } from './repository.types';

/**
 * Generic server-only base class for a Realtime Database subtree. Subclasses pass
 * a base path; every operation is normalized through {@link mapFirebaseError}.
 * A `path` argument is always resolved relative to the base path.
 *
 * Import only from Node.js runtime route handlers, Server Components, or Server
 * Actions — never from `proxy.ts` (middleware/edge) or client code.
 */
export abstract class RealtimeRepository<T> {
	protected readonly basePath: string;

	protected constructor(basePath: string) {
		this.basePath = basePath;
	}

	protected ref(path?: string): Reference {
		const fullPath = path ? `${this.basePath}/${path}` : this.basePath;
		return database().ref(fullPath);
	}

	async get(path?: string): Promise<T | null> {
		try {
			const snapshot = await this.ref(path).get();
			return snapshot.exists() ? (snapshot.val() as T) : null;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async set(value: T, path?: string): Promise<void> {
		try {
			await this.ref(path).set(value);
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async update(value: Partial<T>, path?: string): Promise<void> {
		try {
			await this.ref(path).update(value as object);
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async push(value: T, path?: string): Promise<string> {
		try {
			const ref = await this.ref(path).push(value);
			if (!ref.key) throw new Error('Realtime Database push returned no key');
			return ref.key;
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async remove(path?: string): Promise<void> {
		try {
			await this.ref(path).remove();
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	async query(options: RealtimeQueryOptions, path?: string): Promise<T[]> {
		try {
			const snapshot = await this.buildQuery(this.ref(path), options).get();
			const value = snapshot.val() as Record<string, T> | null;
			return value ? Object.values(value) : [];
		} catch (error) {
			throw mapFirebaseError(error);
		}
	}

	private buildQuery(ref: Reference, options: RealtimeQueryOptions): Query {
		let query: Query = ref;

		if (options.orderByChild) query = query.orderByChild(options.orderByChild);
		if (options.orderByKey) query = query.orderByKey();
		if (options.orderByValue) query = query.orderByValue();
		if (options.equalTo !== undefined) query = query.equalTo(options.equalTo);
		if (options.startAt !== undefined) query = query.startAt(options.startAt);
		if (options.endAt !== undefined) query = query.endAt(options.endAt);
		if (typeof options.limitToFirst === 'number')
			query = query.limitToFirst(options.limitToFirst);
		if (typeof options.limitToLast === 'number')
			query = query.limitToLast(options.limitToLast);

		return query;
	}
}
