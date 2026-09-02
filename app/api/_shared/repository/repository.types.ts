import type { WhereFilterOp } from 'firebase-admin/firestore';

export type WithId<T> = T & { id: string };

export type FirestoreWhere<T> = {
	field: keyof T & string;
	op: WhereFilterOp;
	value: unknown;
};

export type FirestoreOrderBy<T> = {
	field: keyof T & string;
	direction?: 'asc' | 'desc';
};

export type FirestoreQueryOptions<T> = {
	where?: FirestoreWhere<T>[];
	orderBy?: FirestoreOrderBy<T>[];
	limit?: number;
	offset?: number;
	startAfter?: unknown[];
};

export type RealtimeQueryOptions = {
	orderByChild?: string;
	orderByKey?: boolean;
	orderByValue?: boolean;
	equalTo?: string | number | boolean | null;
	startAt?: string | number | boolean | null;
	endAt?: string | number | boolean | null;
	limitToFirst?: number;
	limitToLast?: number;
};
