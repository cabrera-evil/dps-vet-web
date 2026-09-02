import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Role } from '@/constants/enum';
import { contactController } from '../contact.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.get(id);
		},
		[Role.ADMIN, Role.SUPER_ADMIN]
	)
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.update(request, id);
		},
		[Role.ADMIN, Role.SUPER_ADMIN]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.remove(id);
		},
		[Role.ADMIN, Role.SUPER_ADMIN]
	)
);
