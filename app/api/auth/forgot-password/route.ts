import { withRoute } from '@/app/api/_shared/http/handler';
import { forgotPasswordController } from './forgot-password.module';

export const POST = withRoute((request) =>
	forgotPasswordController.requestReset(request)
);
