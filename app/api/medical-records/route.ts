import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicalRecordController } from './medical-record.module';

export const GET = withRoute(
	withAuth(
		(request, context) =>
			medicalRecordController.list(request, context.identity!),
		[Permission.MEDICAL_RECORDS_READ]
	)
);

export const POST = withRoute(
	withAuth(
		(request, context) =>
			medicalRecordController.create(request, context.identity!),
		[Permission.MEDICAL_RECORDS_WRITE]
	)
);
