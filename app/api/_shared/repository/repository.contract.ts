import type { DocumentData, UpdateData } from 'firebase-admin/firestore';
import type { FirestoreQueryOptions, WithId } from './repository.types';

/**
 * Read-side of a repository (ISP — consumers that only query depend on this).
 */
export interface ReadRepository<T, TQuery = unknown> {
	findById(id: string): Promise<WithId<T> | null>;
	findOne(options?: TQuery): Promise<WithId<T> | null>;
	findMany(options?: TQuery): Promise<WithId<T>[]>;
	count(options?: TQuery): Promise<number>;
	exists(id: string): Promise<boolean>;
}

/**
 * Write-side of a repository (ISP — consumers that only mutate depend on this).
 */
export interface WriteRepository<T, TUpdate = Partial<T>> {
	create(data: T, id?: string): Promise<WithId<T>>;
	update(id: string, data: TUpdate): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface CrudRepository<T, TQuery = unknown, TUpdate = Partial<T>>
	extends ReadRepository<T, TQuery>, WriteRepository<T, TUpdate> {}

/**
 * CRUD repository backed by Firestore. Services depend on this abstraction, not
 * on a concrete repository class (DIP).
 */
export type FirestoreCrudRepository<T extends DocumentData> = CrudRepository<
	T,
	FirestoreQueryOptions<T>,
	UpdateData<T>
>;
