import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { serviceController } from './service.module';

/** Public catalog browse — no `withAuth`, satisfies visitor access. */
export const GET = withRoute((request) => serviceController.list(request));

export const POST = withRoute(
	withAuth(
		(request) => serviceController.create(request),
		[Permission.SERVICES_WRITE]
	)
);
