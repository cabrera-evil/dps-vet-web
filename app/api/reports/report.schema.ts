import { z } from 'zod';

/** Bounds every report's date range so a query can't force an unbounded collection scan. */
const MAX_REPORT_RANGE_DAYS = 366;

function withinMaxRange(input: { from: string; to: string }): boolean {
	const from = new Date(input.from).getTime();
	const to = new Date(input.to).getTime();
	if (Number.isNaN(from) || Number.isNaN(to) || to < from) return false;
	return to - from <= MAX_REPORT_RANGE_DAYS * 24 * 60 * 60 * 1000;
}

const dateRangeQuerySchema = z
	.object({ from: z.string(), to: z.string() })
	.refine(withinMaxRange, {
		message: `from/to must be a valid, non-negative range of at most ${MAX_REPORT_RANGE_DAYS} days`,
		path: ['to'],
	});

export const appointmentsReportQuerySchema = dateRangeQuerySchema;
export const popularServicesQuerySchema = dateRangeQuerySchema;
export const inventoryTurnoverQuerySchema = dateRangeQuerySchema;

export type AppointmentsReportQuery = z.infer<
	typeof appointmentsReportQuerySchema
>;
export type PopularServicesQuery = z.infer<typeof popularServicesQuerySchema>;
export type InventoryTurnoverQuery = z.infer<
	typeof inventoryTurnoverQuerySchema
>;
