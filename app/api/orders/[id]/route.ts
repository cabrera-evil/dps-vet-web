import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { orderController } from '../order.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return orderController.get(context.identity!, id);
		},
		[Permission.ORDERS_READ]
	)
);

/** Owner (while pending) or staff with the manage-all bypass may cancel. */
export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return orderController.cancel(context.identity!, id);
		},
		[Permission.ORDERS_WRITE]
	)
);
