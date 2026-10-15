import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { logoutController } from './logout.module';

export const POST = withRoute(
	withAuth((request, context) =>
		logoutController.logout(request, context.identity!)
	)
);
