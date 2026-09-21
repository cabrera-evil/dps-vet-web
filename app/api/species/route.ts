import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { speciesController } from './species.module';

/** Fixed lookup catalog seeded via `scripts/seed` — any authenticated user may browse it. */
export const GET = withRoute(withAuth(() => speciesController.list()));
