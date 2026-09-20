import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { orderController } from '../../order.module';

/** Staff-only: marks a `PENDING` order as picked up. */
export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return orderController.fulfill(context.identity!, id);
		},
		[Permission.ORDERS_MANAGE_ALL]
	)
);
