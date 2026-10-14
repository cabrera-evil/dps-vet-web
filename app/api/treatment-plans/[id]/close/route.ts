import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { treatmentPlanCloseController } from '@/app/api/treatment-plans/treatment-plan-close.module';
import { Permission } from '@/constants/permission';

export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return treatmentPlanCloseController.close(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
