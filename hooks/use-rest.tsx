import { queryClient } from '@/constants/environment';
import { create, list, listWithPagination, remove, update } from '@/lib/rest';
import { ApiResponse } from '@/types/api.type';
import { RequestParams } from '@/types/rest.type';
import {
	InfiniteData,
	UseInfiniteQueryOptions,
	UseMutationOptions,
	UseQueryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import rison from 'rison';

// Type aliases for cleaner code
type QueryKey = [string, Record<string, any>?];
type QueryOptions<T> = Omit<
	UseQueryOptions<T, Error, T, QueryKey>,
	'queryKey' | 'queryFn'
>;
type MutationOptions<T> = UseMutationOptions<T, Error, RequestParams>;
type InfiniteQueryOptions<T> = Omit<
	UseInfiniteQueryOptions<
		ApiResponse<T[]>,
		Error,
		InfiniteData<ApiResponse<T[]>>,
		QueryKey,
		number
	>,
	'queryKey' | 'queryFn'
>;

/**
 * Custom hook for pre-fetching data (SSR)
 */
export async function usePrefetch<T>(
	requestParams: RequestParams
): Promise<void> {
	await queryClient.prefetchQuery<T, Error, T, QueryKey>({
		queryKey: [requestParams.path, requestParams],
		queryFn: () => list<T>(requestParams),
	});
}

/**
 * Custom hook for GET requests
 */
export function useGet<T>(
	requestParams: RequestParams,
	options?: QueryOptions<T>
) {
	return useQuery<T, Error, T, QueryKey>({
		queryKey: [requestParams.path, requestParams],
		queryFn: () => list<T>(requestParams),
		...options,
	});
}

/**
 * Custom hook for POST requests
 */
export function usePost<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: create<T>,
		...options,
	});
}

/**
 * Custom hook for PATCH requests
 */
export function usePatch<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: update<T>,
		...options,
	});
}

/**
 * Custom hook for DELETE requests
 */
export function useDelete<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: remove<T>,
		...options,
	});
}

/**
 * Custom hook for infinite queries with pagination
 */
export function useInfiniteGet<T>(
	requestParams: RequestParams,
	options?: InfiniteQueryOptions<T>
) {
	return useInfiniteQuery<
		ApiResponse<T[]>,
		Error,
		InfiniteData<ApiResponse<T[]>>,
		QueryKey,
		number
	>({
		queryKey: [requestParams.path, requestParams],
		queryFn: async ({ pageParam = 1 }) => {
			const prevQ = (() => {
				try {
					const raw = requestParams?.params?.q;
					return typeof raw === 'string' ? rison.decode(raw) : (raw ?? {});
				} catch {
					return {};
				}
			})();
			return await listWithPagination<T[]>({
				...requestParams,
				params: {
					...requestParams.params,
					q: rison.encode({
						...prevQ,
						page: pageParam,
					}),
				},
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { page, pageCount } = lastPage.pagination!;
			return page < pageCount ? page + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			const { page } = firstPage.pagination!;
			return page > 1 ? page - 1 : undefined;
		},
		...options,
	});
}
