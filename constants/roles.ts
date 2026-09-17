/**
 * Known initial role names — a typed mirror of the `roles` Firestore catalog
 * (seeded via `scripts/seed/catalog/role.catalog.ts`), analogous to how
 * `Permission` mirrors the `permissions` collection. This is **not** an
 * authorization construct: nothing gates access by `RoleName` — all
 * authorization checks are permission-based (`utils/permission.ts`'s
 * `hasPermission`). New roles can still be added directly in Firestore
 * without extending this enum; it only exists for type-safe references to
 * the roles this codebase seeds/assumes exist (e.g. the default
 * self-registration role).
 */
export enum RoleName {
	CLIENTE = 'CLIENTE',
	EMPLEADO = 'EMPLEADO',
	ADMINISTRADOR = 'ADMINISTRADOR',
}
