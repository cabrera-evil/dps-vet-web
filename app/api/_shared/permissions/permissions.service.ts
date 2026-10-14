import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { RoleDocument } from '@/app/api/_shared/repository/role.types';
import type { User } from '@/app/api/users/user.schema';
import type { Permission } from '@/constants/permission';

export type PermissionLookup = (uid: string) => Promise<Permission[]>;

/**
 * Builds the single source of truth for a user's CURRENT permissions:
 * `users/{uid}.role` -> `roles/{role}.permissions`. A missing user or role
 * yields `[]`. Repository errors propagate so callers fail closed. No
 * caching here on purpose (max staleness 0): each call reads Firestore.
 */
export function createPermissionLookup(
	userRepo: Pick<FirestoreReadRepository<User>, 'findById'>,
	roleRepo: Pick<FirestoreReadRepository<RoleDocument>, 'findById'>
): PermissionLookup {
	return async (uid) => {
		const user = await userRepo.findById(uid);
		if (!user?.role) return [];
		const role = await roleRepo.findById(user.role);
		return role?.permissions ?? [];
	};
}
