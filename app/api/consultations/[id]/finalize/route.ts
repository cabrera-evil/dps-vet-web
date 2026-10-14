import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { consultationController } from '../../consultation.module';

/** Turns a draft into a definitive part of the patient's history. */
export const POST = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return consultationController.finalize(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
