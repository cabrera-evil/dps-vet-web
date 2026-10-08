import type { LowStockReport } from '@/app/api/reports/report.types';
import { useCanReadReports } from '@/hooks/use-can-read-reports';
import { useGet } from '@/hooks/use-rest';

export function useLowStock() {
	const canReadReports = useCanReadReports();
	const { data, isLoading, isError } = useGet<LowStockReport>(
		{ path: '/reports/low-stock' },
		{ enabled: canReadReports }
	);

	return {
		count: data?.count,
		items: data?.items ?? [],
		isLoading: canReadReports && isLoading,
		isError,
	};
}
