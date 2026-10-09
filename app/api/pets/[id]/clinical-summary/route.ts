import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { clinicalSummaryController } from '@/app/api/clinical-summary/clinical-summary.module';
import { Permission } from '@/constants/permission';

export const GET = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return clinicalSummaryController.get(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);
