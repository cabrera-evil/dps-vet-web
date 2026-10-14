import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { diagnosisCatalogController } from './diagnosis-catalog.module';

export const GET = withRoute(withAuth(() => diagnosisCatalogController.list()));
