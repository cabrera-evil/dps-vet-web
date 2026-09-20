import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { orderController } from './order.module';

export const GET = withRoute(
	withAuth(
		(request, context) => orderController.list(request, context.identity!),
		[Permission.ORDERS_READ]
	)
);

export const POST = withRoute(
	withAuth(
		(request, context) => orderController.create(request, context.identity!),
		[Permission.ORDERS_WRITE]
	)
);
