import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { appointmentController } from './appointment.module';

export const GET = withRoute(
	withAuth(
		(request, context) =>
			appointmentController.list(request, context.identity!),
		[Permission.APPOINTMENTS_READ]
	)
);

export const POST = withRoute(
	withAuth(
		(request, context) =>
			appointmentController.create(request, context.identity!),
		[Permission.APPOINTMENTS_WRITE]
	)
);
