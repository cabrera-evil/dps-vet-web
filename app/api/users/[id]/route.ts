import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { userController } from '../user.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return userController.get(id);
		},
		[Permission.USERS_READ]
	)
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return userController.updateRole(request, id);
		},
		[Permission.USERS_UPDATE]
	)
);
