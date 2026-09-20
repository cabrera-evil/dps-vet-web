import { withRoute } from '@/app/api/_shared/http/handler';
import { loginController } from './login.module';

export const POST = withRoute((request) => loginController.login(request));
