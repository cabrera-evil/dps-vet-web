import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { medicalRecordController } from '../../../medical-record.module';

/**
 * Issues a short-lived signed download URL for `?path=`, scoped to the
 * caller's pet-ownership check — a client can never receive a URL for
 * another client's attachment.
 */
export const GET = withRoute(
	withAuth(
		async (request, context) => {
			const { id } = await context.params;
			return medicalRecordController.getAttachmentDownloadUrl(
				request,
				context.identity!,
				id
			);
		},
		[Permission.MEDICAL_RECORDS_READ]
	)
);
