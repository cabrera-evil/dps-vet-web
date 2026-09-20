import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicationController } from '../medication.module';

/**
 * Unlike `services`, this catalog exposes `stock` — a business-sensitive
 * figure — so it requires authentication (any signed-in role), not public
 * browse.
 */
export const GET = withRoute(
	withAuth(async (request, context) => {
		const { id } = await context.params;
		return medicationController.get(id);
	})
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicationController.update(request, id);
		},
		[Permission.MEDICATIONS_WRITE]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicationController.remove(id);
		},
		[Permission.MEDICATIONS_WRITE]
	)
);
