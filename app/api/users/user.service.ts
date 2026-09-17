import { mapFirebaseError } from '@/app/api/_shared/errors/firebase-error';
import { auth } from '@/app/api/_shared/firebase';
import type {
	FirestoreCrudRepository,
	ReadRepository,
} from '@/app/api/_shared/repository/repository.contract';
import type {
	FirestoreQueryOptions,
	WithId,
} from '@/app/api/_shared/repository/repository.types';
import type { RoleDocument } from '@/app/api/_shared/repository/role.types';
import type { Permission } from '@/constants/permission';
import { RoleName } from '@/constants/roles';
import createHttpError from 'http-errors';
import type {
	CreateUserInput,
	ListUsersQuery,
	UpdateUserRoleInput,
	User,
} from './user.schema';
import type { UserListResult } from './user.types';

/** Role assigned to every self-registered account; staff/admin roles are only ever granted via `updateRole`. */
const DEFAULT_REGISTRATION_ROLE: RoleName = RoleName.CLIENTE;

/**
 * User domain logic. Depends on the {@link FirestoreCrudRepository} for
 * `users` and a read-only {@link ReadRepository} for `roles` (ISP — this
 * service never writes to the `roles` collection). Concrete repositories are
 * chosen in `user.module.ts`.
 */
export class UserService {
	constructor(
		private readonly repo: FirestoreCrudRepository<User>,
		private readonly roleRepo: ReadRepository<RoleDocument>
	) {}

	async list(query: ListUsersQuery): Promise<UserListResult> {
		const { page, pageSize, role } = query;
		const where: FirestoreQueryOptions<User>['where'] = role
			? [{ field: 'role', op: '==', value: role }]
			: undefined;

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where,
				orderBy: [{ field: 'createdAt', direction: 'desc' }],
				offset: (page - 1) * pageSize,
				limit: pageSize,
			}),
			this.repo.count({ where }),
		]);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				pageCount: Math.max(1, Math.ceil(total / pageSize)),
			},
		};
	}

	async getById(id: string): Promise<WithId<User>> {
		const user = await this.repo.findById(id);
		if (!user) throw new createHttpError.NotFound('User not found');
		return user;
	}

	/**
	 * Creates the Firebase Auth user and the Firestore profile document as one
	 * unit. If the Firestore write fails after the Auth user was created, the
	 * Auth user is deleted so the two never drift apart.
	 */
	async register(input: CreateUserInput): Promise<WithId<User>> {
		const permissions = await this.resolvePermissions(
			DEFAULT_REGISTRATION_ROLE
		);

		let uid: string;
		try {
			const authUser = await auth().createUser({
				email: input.email,
				password: input.password,
				displayName: input.name,
			});
			uid = authUser.uid;
			await auth().setCustomUserClaims(uid, { permissions });
		} catch (error) {
			throw mapFirebaseError(error);
		}

		try {
			return await this.repo.create(
				{
					uid,
					name: input.name,
					email: input.email,
					phone: input.phone,
					role: DEFAULT_REGISTRATION_ROLE,
					createdAt: new Date().toISOString(),
				},
				uid
			);
		} catch (error) {
			await auth()
				.deleteUser(uid)
				.catch(() => undefined);
			throw error;
		}
	}

	/**
	 * Changes a user's role: resolves the new role's permissions, updates the
	 * Firebase custom claim, then the Firestore `role` field — in that order,
	 * in one method, so the claim and the stored role can't drift apart.
	 */
	async updateRole(
		id: string,
		input: UpdateUserRoleInput
	): Promise<WithId<User>> {
		if (!(await this.repo.exists(id)))
			throw new createHttpError.NotFound('User not found');

		const permissions = await this.resolvePermissions(input.role);

		try {
			await auth().setCustomUserClaims(id, { permissions });
		} catch (error) {
			throw mapFirebaseError(error);
		}

		await this.repo.update(id, { role: input.role });
		return this.getById(id);
	}

	private async resolvePermissions(role: string): Promise<Permission[]> {
		const roleDoc = await this.roleRepo.findById(role);
		if (!roleDoc)
			throw new createHttpError.UnprocessableEntity(`Unknown role: ${role}`);
		return roleDoc.permissions;
	}
}
