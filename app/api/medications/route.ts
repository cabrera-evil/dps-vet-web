import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicationController } from './medication.module';

/**
 * Unlike `services`, this catalog exposes `stock` — a business-sensitive
 * figure — so it requires authentication (any signed-in role), not public
 * browse.
 */
export const GET = withRoute(
	withAuth((request) => medicationController.list(request))
);

export const POST = withRoute(
	withAuth(
		(request) => medicationController.create(request),
		[Permission.MEDICATIONS_WRITE]
	)
);
