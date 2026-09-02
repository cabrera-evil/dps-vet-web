import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Role } from '@/constants/enum';
import { contactController } from './contact.module';

export const GET = withRoute(
	withAuth(
		(request) => contactController.list(request),
		[Role.ADMIN, Role.SUPER_ADMIN]
	)
);

export const POST = withRoute((request) => contactController.create(request));
