import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { breedController } from './breed.module';

/** Fixed lookup catalog seeded via `scripts/seed` — any authenticated user may browse it. */
export const GET = withRoute(withAuth(() => breedController.list()));
