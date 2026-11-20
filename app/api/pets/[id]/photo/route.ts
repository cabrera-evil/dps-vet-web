import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { petController } from '../../pet.module';

export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return petController.setPhoto(request, context.identity!, id);
		},
		[Permission.PETS_WRITE]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return petController.removePhoto(context.identity!, id);
		},
		[Permission.PETS_WRITE]
	)
);
