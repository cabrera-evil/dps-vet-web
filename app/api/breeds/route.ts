import { withAuth, withRoute } from '@/app/api/_shared/http/handler';
import { breedController } from './breed.module';

/** Seed-managed catalog — any authenticated user may browse it; `?species=` narrows it to one species. */
export const GET = withRoute(
	withAuth((request) => breedController.list(request))
);
