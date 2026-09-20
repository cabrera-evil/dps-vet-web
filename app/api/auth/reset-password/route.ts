import { withRoute } from '@/app/api/_shared/http/handler';
import { resetPasswordController } from './reset-password.module';

export const POST = withRoute((request) =>
	resetPasswordController.reset(request)
);
