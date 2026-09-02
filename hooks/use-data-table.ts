'use client';

import { DEBOUNCE_MS, THROTTLE_MS } from '@/constants/defaults';
import { FindManyArgs } from '@/types/prisma.type';
import {
	ColumnDef,
	ColumnFiltersState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table';
import {
	createParser,
	parseAsInteger,
	useQueryState,
	UseQueryStateOptions,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import rison from 'rison';
import { useDebounceValue } from 'usehooks-ts';
import { useInfiniteGet } from './use-rest';

// Types
export interface UseDataTableProps<T> {
	columns: ColumnDef<T>[];
	endpoint: string;
	defaultPageSize?: number;
	include?: Record<string, boolean>;
	baseWhere?: Record<string, any>;
	history?: 'push' | 'replace';
	debounceMs?: number;
	throttleMs?: number;
	clearOnDefault?: boolean;
	enableAdvancedFilter?: boolean;
	scroll?: boolean;
	shallow?: boolean;
	startTransition?: React.TransitionStartFunction;
}

// Optimized state parser factory
const createStateParser = <T>(defaultValue: T) =>
	createParser({
		parse: (value: string): T => {
			try {
				return rison.decode(value) as T;
			} catch {
				return defaultValue;
			}
		},
		serialize: (value: T): string => {
			const isEmpty = Array.isArray(value)
				? value.length === 0
				: typeof value === 'object' && value !== null
					? Object.keys(value).length === 0
					: !value;
			return isEmpty ? '' : rison.encode(value);
		},
	});

// State parsers
const sortingParser = createStateParser<SortingState>([]);
const columnFiltersParser = createStateParser<ColumnFiltersState>([]);
const columnVisibilityParser = createStateParser<VisibilityState>({});

export function useDataTable<T>({
	columns,
	endpoint,
	defaultPageSize = 10,
	include = {},
	baseWhere = {},
	history = 'replace',
	debounceMs = DEBOUNCE_MS,
	throttleMs = THROTTLE_MS,
	clearOnDefault = false,
	scroll = false,
	shallow = true,
	startTransition,
}: UseDataTableProps<T>) {
	// Query state options
	const queryStateOptions = useMemo<
		Omit<UseQueryStateOptions<string>, 'parse'>
	>(
		() => ({
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		}),
		[
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		]
	);

	// Query state management
	const [sorting, setSorting] = useQueryState(
		'orderBy',
		sortingParser.withOptions(queryStateOptions).withDefault([])
	);
	const [columnFilters, setColumnFilters] = useQueryState(
		'where',
		columnFiltersParser.withOptions(queryStateOptions).withDefault([])
	);
	const [columnVisibility, setColumnVisibility] = useQueryState(
		'visibility',
		columnVisibilityParser.withOptions(queryStateOptions).withDefault({})
	);
	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
	const [pageSize, setPageSize] = useQueryState(
		'pageSize',
		parseAsInteger.withOptions(queryStateOptions).withDefault(defaultPageSize)
	);

	// Pagination state (0-based for react-table)
	const pagination = useMemo<PaginationState>(
		() => ({ pageIndex: page - 1, pageSize }),
		[page, pageSize]
	);

	// Debounced filters for API efficiency
	const [debouncedFilters] = useDebounceValue(columnFilters, debounceMs);

	// API query
	const apiQuery = useMemo(() => {
		const where = { ...baseWhere };
		// Process filters
		debouncedFilters.forEach(({ id, value }) => {
			if (value == null || value === '') return;
			where[id] =
				Array.isArray(value) && value.length > 0
					? { in: value }
					: { contains: String(value), mode: 'insensitive' };
		});
		const queryParams: FindManyArgs = {
			where,
			...(sorting.length > 0 && {
				orderBy: Object.fromEntries(
					sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc'])
				) as Record<string, 'asc' | 'desc'>,
			}),
			...(Object.keys(include).length > 0 && {
				include: include,
			}),
			pageSize,
		};
		return rison.encode(queryParams);
	}, [baseWhere, debouncedFilters, include, pageSize, sorting]);

	// Infinite query
	const infiniteQuery = useInfiniteGet<T>({
		path: endpoint,
		params: { q: apiQuery },
	});

	// Optimized handlers
	const handleSortingChange = useCallback(
		(newState: SortingState | ((prev: SortingState) => SortingState)) => {
			setSorting(newState);
			if (page !== 1) setPage(1);
		},
		[setSorting, page, setPage]
	);

	const handleColumnFiltersChange = useCallback(
		(
			newState:
				| ColumnFiltersState
				| ((prev: ColumnFiltersState) => ColumnFiltersState)
		) => {
			setColumnFilters(newState);
			if (page !== 1) setPage(1);
		},
		[setColumnFilters, page, setPage]
	);

	const handleColumnVisibilityChange = useCallback(
		(
			newState: VisibilityState | ((prev: VisibilityState) => VisibilityState)
		) => {
			setColumnVisibility(newState);
		},
		[setColumnVisibility]
	);

	// Pagination handler
	const handlePaginationChange = useCallback(
		(
			newPagination:
				| PaginationState
				| ((prev: PaginationState) => PaginationState)
		) => {
			const resolved =
				typeof newPagination === 'function'
					? newPagination(pagination)
					: newPagination;
			if (
				resolved.pageIndex > pagination.pageIndex &&
				infiniteQuery.hasNextPage
			) {
				infiniteQuery.fetchNextPage();
			} else if (
				resolved.pageIndex < pagination.pageIndex &&
				infiniteQuery.hasPreviousPage
			) {
				infiniteQuery.fetchPreviousPage();
			}
			if (resolved.pageIndex + 1 !== page) setPage(resolved.pageIndex + 1);
			if (resolved.pageSize !== pagination.pageSize) {
				setPageSize(resolved.pageSize);
				setPage(1);
			}
		},
		[infiniteQuery, page, pagination, setPage, setPageSize]
	);

	// Data processing
	const { data, isLoading, error } = useMemo(() => {
		const allPages = infiniteQuery.data?.pages || [];
		const targetPageIndex = page - 1;
		const pageData = allPages[targetPageIndex]?.data || [];
		return {
			data: pageData as T[],
			isLoading: infiniteQuery.isLoading || infiniteQuery.isFetching,
			error: infiniteQuery.error,
		};
	}, [infiniteQuery, page]);

	// Page count calculation
	const pageCount = useMemo(() => {
		const paginationData = infiniteQuery.data?.pages[0]?.pagination;
		return paginationData
			? Math.ceil(paginationData.pageCount)
			: Math.ceil((data?.length || 0) / pageSize);
	}, [infiniteQuery.data, data?.length, pageSize]);

	// Table configuration
	const table = useReactTable({
		data,
		columns,
		pageCount,
		state: {
			sorting,
			columnVisibility,
			columnFilters,
			pagination,
		},
		defaultColumn: {
			enableColumnFilter: false,
		},
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		enableRowSelection: true,
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: handleColumnFiltersChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		onPaginationChange: handlePaginationChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return {
		table,
		isLoading,
		error,
		refetch: infiniteQuery.refetch,
	};
}
