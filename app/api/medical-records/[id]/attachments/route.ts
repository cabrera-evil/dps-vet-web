import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicalRecordController } from '../../medical-record.module';

/** Staff requests a signed upload URL for a new attachment. */
export const POST = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalRecordController.requestAttachmentUpload(
				request,
				context.identity!,
				id
			);
		},
		[Permission.MEDICAL_RECORDS_WRITE]
	)
);
