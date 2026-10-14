import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicalHistoryController } from '../../medical-history.module';

/** Archives (soft-removes) a history — clinical history is never deleted. */
export const POST = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return medicalHistoryController.archive(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
