import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { medicalHistoryController } from '@/app/api/medical-histories/medical-history.module';
import { Permission } from '@/constants/permission';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalHistoryController.list(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);

export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalHistoryController.create(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
