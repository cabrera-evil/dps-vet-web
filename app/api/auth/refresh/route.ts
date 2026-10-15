import { withRoute } from '@/app/api/_shared/http/handler';
import { refreshController } from './refresh.module';

export const POST = withRoute((request) => refreshController.refresh(request));
