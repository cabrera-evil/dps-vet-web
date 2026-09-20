import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { petController } from './pet.module';

export const GET = withRoute(
	withAuth(
		(request, context) => petController.list(request, context.identity!),
		[Permission.PETS_READ]
	)
);

export const POST = withRoute(
	withAuth(
		(request, context) => petController.create(request, context.identity!),
		[Permission.PETS_WRITE]
	)
);
