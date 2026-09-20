import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { petController } from '../pet.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return petController.get(context.identity!, id);
		},
		[Permission.PETS_READ]
	)
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return petController.update(request, context.identity!, id);
		},
		[Permission.PETS_WRITE]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return petController.remove(context.identity!, id);
		},
		[Permission.PETS_WRITE]
	)
);
