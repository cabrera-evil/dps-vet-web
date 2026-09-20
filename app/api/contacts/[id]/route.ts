import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { contactController } from '../contact.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.get(id);
		},
		[Permission.CONTACTS_READ]
	)
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.update(request, id);
		},
		[Permission.CONTACTS_UPDATE]
	)
);

export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return contactController.remove(id);
		},
		[Permission.CONTACTS_DELETE]
	)
);
