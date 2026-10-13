import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { followUpControlController } from '@/app/api/consultations/follow-up-control.module';
import { Permission } from '@/constants/permission';

export const GET = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return followUpControlController.get(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);
