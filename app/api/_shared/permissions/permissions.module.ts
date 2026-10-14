import { RoleRepository } from '@/app/api/_shared/repository/role.repository';
import { UserRepository } from '@/app/api/users/user.repository';
import { createPermissionLookup } from './permissions.service';

/**
 * Shared server-side permission lookup, used by `withAuth` and `proxy.ts`
 * (Node.js runtime, direct call, no HTTP self-call). Always reads Firestore.
 */
export const getPermissions = createPermissionLookup(
	new UserRepository(),
	new RoleRepository()
);
