import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { appointmentController } from '../appointment.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return appointmentController.get(context.identity!, id);
		},
		[Permission.APPOINTMENTS_READ]
	)
);

/** Client-side cancel of their own appointment (before it starts). */
export const DELETE = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return appointmentController.cancel(context.identity!, id);
		},
		[Permission.APPOINTMENTS_WRITE]
	)
);
