import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { Permission } from '@/constants/permission';
import { userController } from './user.module';

export const GET = withRoute(
	withAuth((request) => userController.list(request), [Permission.USERS_READ])
);

export const POST = withRoute((request) => userController.register(request));
