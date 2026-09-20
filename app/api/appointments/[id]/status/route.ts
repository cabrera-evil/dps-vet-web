import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { appointmentController } from '../../appointment.module';

/** Staff-side status transitions (confirm/attend/no-show/cancel). */
export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return appointmentController.updateStatus(request, context.identity!, id);
		},
		[Permission.APPOINTMENTS_MANAGE_ALL]
	)
);
