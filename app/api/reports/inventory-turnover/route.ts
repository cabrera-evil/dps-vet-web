import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { reportController } from '../report.module';

export const GET = withRoute(
	withAuth(
		(request) => reportController.inventoryTurnover(request),
		[Permission.REPORTS_READ]
	)
);
