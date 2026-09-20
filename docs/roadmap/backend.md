# Backend Roadmap — Firebase Integration (`app/api/**`)

Companion to `docs/roadmap/frontend.md`. Source of requirements: `docs/course/DPS941/Tasks/Phase-01/Proyecto de Catedra DPS.md` and `docs/course/DPS941/Tasks/Activities.md`. Branch: `feature/firebase-integration`.

Every module is a vertical slice following the structure in `app/api/contacts/`: `*.schema.ts` (zod), `*.types.ts`, `*.repository.ts` (extends `FirestoreRepository<T>`), `*.service.ts` (domain rules, depends on `FirestoreCrudRepository<T>`), `*.controller.ts` (parsing/response shaping only), `*.module.ts` (wiring), `route.ts` + `[id]/route.ts` (`withRoute(withAuth(handler, permissions))`).

**Naming/authorization conventions actually in use** (roadmap text below still uses the original Spanish names and a `Role` model — treat both as stale):

- Collections and code are English (`users`, `pets`, `services`, `appointments`, `medical-records`, `medications`, `orders`), not the Spanish names below.
- No `Role` enum/hierarchy. Authorization is permission-based (`constants/permission.ts`'s `Permission`, `utils/permission.ts`'s `hasPermission`). A "role" is a named permission group administered in Firestore's `roles` collection, seeded via `scripts/seed/`.
- `withAuth` attaches the resolved `{ uid, permissions }` identity onto `RouteContext` (`Identity` type in `http.types.ts`); tenant-scoped services use it for ownership checks.

## Deadlines

| Date          | Deliverable                     | Backend must have                    |
| ------------- | ------------------------------- | ------------------------------------ |
| 2026-09-20    | Etapa 2 partial web delivery    | Phases 0–4 working end to end        |
| 2026-09-21/25 | Defense of Etapa 2              | Auth + Citas demoable live           |
| 2026-11-08    | React Native adds Firebase Auth | REST contract from Phases 0–2 stable |
| 2026-11-22    | Final delivery                  | All phases shipped                   |

## Progress Checklist

- [~] Phase 0 — Secrets & environment hygiene — mostly done; key file deletion and Firestore Security Rules check still open
- [x] Phase 1 — Firebase Auth swap — done, permissions-only model
- [x] Phase 2 — `users`/roles — done
- [x] Phase 3 — `pets` — done
- [x] Phase 4 — `services` — done
- [x] Phase 5 — `appointments` — done
- [x] Phase 6 — `medical-records` + Storage — done
- [x] Phase 7 — `medications` + `orders` — done
- [x] Phase 8 — `reports` — done
- [ ] Phase 9 — Retire the legacy REST backend path

## Blocking issue — partially resolved

`config/firebase.json` is a raw Firebase Admin service-account key untracked in the working tree. `app/api/_shared/firebase/config.ts` reads the same credentials from env vars, so this file is redundant.

- [x] Credentials copied into `.env`; `pnpm build` verified.
- [ ] Copy the same values into Vercel's env settings.
- [x] `.gitignore` broadened to `config/*.json`.
- [ ] Delete `config/firebase.json` — left in place at the user's request; revisit before merge/deploy.
- [ ] `FIREBASE_STORAGE_BUCKET`/`FIREBASE_DATABASE_URL` are still placeholders — confirm real values before Storage/Realtime DB usage.

## Current state

- `app/api/_shared/firebase|repository|http|errors/*` — done (Admin SDK singleton, generic CRUD, `withRoute`/`withAuth`, error mapping).
- `app/api/contacts/*` — done (template slice).
- `app/api/protected/route.ts` — sanity-check route only.
- `auth.ts` — Firebase ID token verification via `CredentialsProvider`; legacy REST login removed.
- `scripts/seed/*` — Prisma-seed-style catalog seeding (`pnpm db:seed`) for `permissions`/`roles`; not yet run against a real project.
- `proxy.ts` — permission-gating via the NextAuth JWT; marked deprecated by an earlier commit, intent unclarified.
- No `firestore.rules`/`.firebaserc` exists — Security Rules must be checked directly in the Firebase console.

---

## Phase 0 — Secrets & environment hygiene — mostly done

- [x] `.env` populated, `pnpm build` passes; JSON key file still present (user's call).
- [x] `.env.example` matches `env.d.ts`.
- [ ] Confirm Firestore Security Rules deny direct client access (console-side, not verifiable here).

## Phase 1 — Firebase Authentication swap — done

Authorization is permissions-only, not the `Role.CLIENTE|EMPLEADO|ADMINISTRADOR` rename originally planned: `constants/permission.ts`'s `Permission` enum + `utils/permission.ts`'s `hasPermission`, mirrored in `constants/route.ts`, `handler.ts`'s `withAuth`, and `next-auth-wrapper.tsx`'s `PermissionWrapper`. Roles are Firestore-administered permission groups, not a stored enum.

`auth.ts`'s `authorize()` verifies a Firebase ID token (`auth.verifyIdToken`) instead of the legacy `auth/login` REST call; `withAuth` resolves identity from either the NextAuth session cookie or an `Authorization: Bearer <idToken>` header, both producing `{ uid, permissions }`.

## Phase 2 — Firestore schema + `users`/roles — done

`users` collection (not `usuarios`), keyed by Firebase uid: `{ uid, name, email, phone, role, createdAt }`. `role` is a plain string referencing `roles/{name}`, not a TS enum. `roles`/`permissions` collections seeded via `scripts/seed/catalog/`.

- `POST /api/users` (public registration) creates the Firebase Auth user + Firestore profile atomically; self-registration always assigns `CLIENTE`.
- `PATCH /api/users/[id]` (`Permission.USERS_UPDATE`, Administrador only): resolves the new role's permissions, updates the custom claim, then the Firestore `role` field, in that order.
- `GET /api/users`, `GET /api/users/[id]` (`Permission.USERS_READ`).

## Phase 3 — `pets` module — done

`{ ownerId, name, species, breed, birthDate, notes, createdAt }`. Tenant isolation: a caller without `Permission.PETS_MANAGE_ALL` is restricted to `ownerId === identity.uid`, enforced in the service, never trusting a client-supplied id. Routes: `GET/POST /api/pets`, `GET/PATCH/DELETE /api/pets/[id]`. Ownership failures return 404, not 403.

## Phase 4 — `services` module — done

`{ name, description, durationMinutes, price, category, active, createdAt }`. `GET /api/services` is public and always forces `active: true`. Mutations require `Permission.SERVICES_WRITE` (Administrador only). `durationMinutes` feeds Phase 5's slot-length computation.

## Phase 5 — `appointments` module — done

`{ clientId, petId, serviceId, staffId?, start, end, status, createdAt }`, status `PENDING|CONFIRMED|ATTENDED|CANCELLED|NO_SHOW`. `end` is derived server-side from `start + service.durationMinutes`.

Overlap safety uses a shared day-lock document (`appointment-day-locks/{day}`, a `slots` map of `appointmentId -> {start, end}`) read and written inside the same Firestore transaction as the appointment create/cancel — a transaction wrapped only around a same-day query isn't atomic, since a not-yet-existing document can't be locked. The check also covers the previous day's lock for appointments crossing midnight. Cancelling frees the slot from the lock doc.

Status is a fixed state machine (`PENDING → CONFIRMED|CANCELLED`, `CONFIRMED → ATTENDED|CANCELLED|NO_SHOW`); invalid transitions return 422. Client actions (`create`, `DELETE .../[id]` cancel) vs staff actions (`PATCH .../[id]/status`) are separate routes with separate permissions. A caller with `Permission.APPOINTMENTS_MANAGE_ALL` may book on a client's behalf; a plain client's `clientId`/`staffId` are always server-derived.

## Phase 6 — `medical-records` module + Storage — done

`{ petId, staffId, date, diagnosis, treatment, notes, attachmentPaths: string[] }`. Only the Storage path is ever persisted, never a public URL. `POST /api/medical-records/[id]/attachments` returns a signed write URL; `GET .../attachments/download?path=` returns a short-lived signed read URL, both gated by the same pet-ownership check as `getById`.

## Phase 7 — `medications` + `orders` modules — done

`medications`: `{ name, description, stock, price, active }`, mirrors `services`, requires auth to read (stock is sensitive). `orders`: `{ clientId, items: [{ medicationId, quantity }], status, createdAt }`.

`OrderRepository.createWithStockDecrement`/`.cancelWithRestock` keep `orders` and `medications.stock` atomic via `runTransaction`, aggregating quantities by distinct `medicationId` first — an order repeating the same medication across line items must be checked/adjusted once for the summed quantity, not once per line item. `PATCH /api/orders/[id]/fulfill` (staff-only) is a plain status flip.

## Phase 8 — `reports` module — done

`GET /api/reports/appointments?from&to`, `/popular-services?from&to`, `/inventory-turnover?from&to` — admin-only, aggregated in the service layer from `findMany` results. All three require a bounded date range (max 366 days) to avoid an unbounded collection scan.

## Phase 9 — Retire the legacy REST backend path

- Grep `lib/rest.ts`/`services/rest.service.tsx` for anything still assuming the old external backend and delete or repoint it.
- Finish what the `chore: deprecation notice for proxy handler` commit started on `proxy.ts` — clarify intended end state before changing routing behavior.
- Acceptance: no remaining code path depends on `NEXT_PUBLIC_API_URL` pointing at a non-Firebase backend, or that dependency is intentional and documented.

## Notes

- `firestore.indexes.json` (repo root) defines the composite indexes every module's filtered `list()` needs — not yet deployed (`firebase deploy --only firestore:indexes`).
- `pnpm db:seed` needs to be run against a real Firebase project to push the permission/role catalogs.
