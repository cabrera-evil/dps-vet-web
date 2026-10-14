import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { consultationController } from '../consultation.module';

export const GET = withRoute(
	withAuth(
		async (_request, context) => {
			const { id } = await context.params;
			return consultationController.get(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);

/** Replaces the content of a draft consultation. */
export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return consultationController.update(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE, Permission.MEDICAL_RECORDS_MANAGE_ALL],
		'all'
	)
);
