import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicalRecordController } from '../medical-record.module';

export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalRecordController.get(context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_READ]
	)
);

export const PATCH = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalRecordController.update(request, context.identity!, id);
		},
		[Permission.MEDICAL_RECORDS_WRITE]
	)
);
