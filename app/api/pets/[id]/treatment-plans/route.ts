import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { treatmentPlanController } from '@/app/api/treatment-plans/treatment-plan.module';
import { Permission } from '@/constants/permission';

export const GET = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return treatmentPlanController.listByPet(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);
