import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { encounterController } from '@/app/api/encounters/encounter.module';
import { Permission } from '@/constants/permission';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return encounterController.list(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_MANAGE_ALL]
	)
);
