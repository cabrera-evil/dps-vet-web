import { withRoute } from '@/app/api/_shared/http/handler';
import { tokenController } from './token.module';

export const POST = withRoute((request) => tokenController.issue(request));
