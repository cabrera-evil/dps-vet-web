'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { flexRender, Row, Table as TanstackTable } from '@tanstack/react-table';
import { AlertCircle } from 'lucide-react';
import {
	createElement,
	type ComponentProps,
	type ComponentType,
	type ReactNode,
} from 'react';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData> {
	table: TanstackTable<TData>;
	toolbar?: ReactNode | ComponentType<{ table: TanstackTable<TData> }>;
	isLoading?: boolean;
	error?: Error | null;
	emptyState?: ReactNode;
	onRowClick?: (row: Row<TData>) => void;
	showPagination?: boolean;
	paginationProps?: Omit<
		ComponentProps<typeof DataTablePagination<TData>>,
		'table'
	>;
}

export function DataTable<TData>({
	table,
	toolbar,
	isLoading = false,
	error,
	emptyState = 'No results found.',
	onRowClick,
	showPagination = true,
	paginationProps,
}: DataTableProps<TData>) {
	const columnCount = table.getVisibleLeafColumns().length;
	const toolbarContent =
		typeof toolbar === 'function' ? createElement(toolbar, { table }) : toolbar;

	return (
		<div className="space-y-4">
			{toolbarContent}
			{error && (
				<Alert variant="destructive">
					<AlertCircle />
					<AlertTitle>Unable to load data</AlertTitle>
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, index) => (
								<TableRow key={index}>
									{Array.from({ length: columnCount }).map((_, cellIndex) => (
										<TableCell key={`skeleton-cell-${cellIndex}`}>
											<Skeleton className="h-8 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className={onRowClick ? 'cursor-pointer' : undefined}
									onClick={onRowClick ? () => onRowClick(row) : undefined}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columnCount} className="h-24 text-center">
									{emptyState}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{showPagination && (
				<DataTablePagination table={table} {...paginationProps} />
			)}
		</div>
	);
}
