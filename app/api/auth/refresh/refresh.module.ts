import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';

/** Composition root for the refresh module. */
export const refreshService = new RefreshService();

export const refreshController = new RefreshController(refreshService);
