import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { consultationController } from '@/app/api/consultations/consultation.module';
import { Permission } from '@/constants/permission';

/** Creates a draft consultation for the patient. */
export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return consultationController.create(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
