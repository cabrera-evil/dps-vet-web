import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { permissionsController } from './permissions.module';

export const GET = withRoute(
	withAuth((request, context) =>
		permissionsController.get(request, context.identity!)
	)
);
