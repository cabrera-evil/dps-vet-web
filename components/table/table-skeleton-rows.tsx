import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

/** Row-shaped skeleton for tables outside `DataTable` (which has its own
 * inline version) — keeps the loading state the same width as the real rows
 * instead of a layout-shifting spinner. */
export function TableSkeletonRows({
	columnCount,
	rowCount = 5,
}: {
	columnCount: number;
	rowCount?: number;
}) {
	return (
		<>
			{Array.from({ length: rowCount }).map((_, rowIndex) => (
				<TableRow key={rowIndex}>
					{Array.from({ length: columnCount }).map((_, columnIndex) => (
						<TableCell key={columnIndex}>
							<Skeleton className="h-5 w-full" />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}
