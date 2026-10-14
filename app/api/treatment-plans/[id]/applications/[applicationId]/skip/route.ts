import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { treatmentApplicationController } from '@/app/api/treatment-plans/treatment-application.module';
import { Permission } from '@/constants/permission';

export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id, applicationId } = await context.params;
			return treatmentApplicationController.skip(
				request,
				context.identity!,
				id,
				applicationId
			);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
