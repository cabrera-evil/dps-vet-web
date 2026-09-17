import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { contactController } from './contact.module';

export const GET = withRoute(
	withAuth(
		(request) => contactController.list(request),
		[Permission.CONTACTS_READ]
	)
);

export const POST = withRoute((request) => contactController.create(request));
