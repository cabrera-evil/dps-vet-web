import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { serviceController } from '../service.module';

/** Public catalog browse — no `withAuth`, satisfies visitor access. */
export const GET = withRoute(async (request, context) => {
	const { id } = await context.params;
	return serviceController.get(id);
});

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return serviceController.update(request, id);
		},
		[Permission.SERVICES_WRITE]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return serviceController.remove(id);
		},
		[Permission.SERVICES_WRITE]
	)
);
