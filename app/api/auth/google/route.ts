import { withRoute } from '@/app/api/_shared/http/handler';
import { googleController } from './google.module';

export const POST = withRoute((request) => googleController.issue(request));
