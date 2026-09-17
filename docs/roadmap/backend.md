# Backend Roadmap — Firebase Integration (`app/api/**`)

Companion to `docs/roadmap/frontend.md`. Source of requirements: `docs/course/DPS941/Tasks/Phase-01/Proyecto de Catedra DPS.md` (Fase I proposal) and `docs/course/DPS941/Tasks/Activities.md` (grading calendar). Branch: `feature/firebase-integration`.

Every module below is built as a vertical slice following the **exact structure already proven in `app/api/contacts/`**: `*.schema.ts` (zod, request/response + entity shape), `*.types.ts` (derived types + composite results), `*.repository.ts` (extends `FirestoreRepository<T>` from `app/api/_shared/repository/firestore.repository.ts`, adds only collection-specific queries), `*.service.ts` (domain rules, depends on the `FirestoreCrudRepository<T>` interface — not the concrete class), `*.controller.ts` (parses/validates via `parseBody`/`parseSearchParams`, shapes responses via `ok`/`created`/`noContent`, zero domain logic), `*.module.ts` (composition root wiring repository → service → controller), `route.ts` (+ `[id]/route.ts`) wrapping the controller in `withRoute(withAuth(handler, allowedRoles))`.

## Deadlines

| Date          | Deliverable                                               | Backend must have                                                                                               |
| ------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-09-20    | Etapa 2 — partial web delivery (REST API + Vercel deploy) | Phases 0–4 working end to end                                                                                   |
| 2026-09-21/25 | Defense of Etapa 2                                        | Auth + Citas (the module the professor will most likely probe, since it's the core business rule) demoable live |
| 2026-11-08    | React Native app adds Firebase Auth + Firestore           | REST contract from Phases 0–2 must be stable — mobile will call these same endpoints                            |
| 2026-11-22    | Final delivery                                            | All phases below shipped                                                                                        |

## ✅ Progress Checklist

- [ ] **Phase 0** — Secrets & environment hygiene (blocked on the untracked service-account key below)
- [x] **Phase 1** — Firebase Authentication swap (`auth.ts`, `withAuth` bearer-token path) — implemented 2026-09-16, but as a **permissions-only** model instead of the `Role` rename originally described below (see the implementation note under Phase 1)
- [ ] **Phase 2** — Firestore schema design + `usuarios`/roles administration
- [ ] **Phase 3** — `mascotas` module
- [ ] **Phase 4** — `servicios` module
- [ ] **Phase 5** — `citas` module
- [ ] **Phase 6** — `historiales` module + Storage
- [ ] **Phase 7** — `medicamentos` + `pedidos` modules
- [ ] **Phase 8** — `reportes` module
- [ ] **Phase 9** — Retire the legacy REST backend path

## ⚠ Blocking issue — do before anything else

`config/udb-dps-project-firebase-adminsdk-fbsvc-eb2f3908cf.json` is a raw Firebase Admin **service-account private key** sitting untracked in the working tree. `app/api/_shared/firebase/config.ts` already reads the same credentials from env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_DATABASE_URL` — see `env.d.ts`), so this file is redundant and must never be committed.

- Copy its `project_id` / `client_email` / `private_key` values into `.env` (escaping newlines as `\n`, per the `.replace(/\\n/g, '\n')` in `config.ts`) and into Vercel's env settings.
- Delete the JSON file from the working tree once copied.
- Confirm `.gitignore` covers `config/*.json` (or the whole `config/` dir if nothing else non-secret lives there) so this can't recur.
- I have not deleted or moved it — needs your confirmation before any `git add`.

## Current state (verified 2026-09-16)

| Piece                                                                                                                                 | Status                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/_shared/firebase/*` (`admin.service.ts`, `config.ts`, `firebase.types.ts`)                                                   | Done — Admin SDK singleton, env-validated config, lazy `getFirestore/getAuth/getStorage/getDatabase`                                                                                                                                                                               |
| `app/api/_shared/repository/*` (`firestore.repository.ts`, `repository.contract.ts`, `repository.types.ts`, `realtime.repository.ts`) | Done — generic CRUD + realtime listener contract                                                                                                                                                                                                                                   |
| `app/api/_shared/http/*` (`request.ts`, `handler.ts`, `response.ts`, `http.types.ts`)                                                 | Done — `withRoute`/`withAuth`, `parseBody`/`parseSearchParams`, `ok`/`created`/`noContent`                                                                                                                                                                                         |
| `app/api/_shared/errors/*` (`firebase-error.ts`, `firebase-status-map.ts`, `error-response.ts`)                                       | Done — Firebase error → HTTP status mapping                                                                                                                                                                                                                                        |
| `app/api/contacts/*`                                                                                                                  | Done — full template slice (public create, admin list/update/remove)                                                                                                                                                                                                               |
| `app/api/protected/route.ts`                                                                                                          | Exists — sanity-check route for `withAuth`, not a real module                                                                                                                                                                                                                      |
| `auth.ts`                                                                                                                             | **Done (2026-09-16)** — `CredentialsProvider` now takes a Firebase `idToken` and calls `verifyFirebaseIdToken` (`app/api/_shared/firebase/verify-id-token.ts`); legacy `auth/login` REST call and manual `jwt`/`refreshToken` cookies removed                                       |
| `app/api/_shared/http/handler.ts`'s `withAuth`                                                                                        | **Done (2026-09-16)** — resolves identity from either the NextAuth session cookie or an `Authorization: Bearer <idToken>` header, both producing `{ uid, permissions }`; gates on `Permission[]`, not roles                                                                        |
| `constants/permission.ts`, `utils/permission.ts`                                                                                     | **Done (2026-09-16)** — atomic `Permission` enum + `hasPermission` set-membership check, replacing the `Role`/`hasRequiredRole` hierarchy entirely (`constants/enum.ts`'s `Role` enum and `utils/role.ts` were deleted, not renamed — see Phase 1 note below)                       |
| `scripts/seed/*`                                                                                                                      | **Done (2026-09-16)** — Prisma-seed-style catalog seeding (`pnpm db:seed`) for Firestore's `permissions`/`roles` collections; not yet executed against a real Firebase project                                                                                                     |
| `proxy.ts`                                                                                                                            | Working (now permission-gating via `next-auth` JWT's `token.permissions`, not role hierarchy), marked deprecated per the `chore: deprecation notice for proxy handler` commit — clarify with the team whether "deprecated" means replace with `next.config.mjs` rewrites/new route matching, or just a naming note, before touching it |
| Firestore collections (`usuarios`, `mascotas`, `servicios`, `medicamentos`, `citas`, `historiales`, `horarios`)                       | None exist yet beyond `contacts` — and per the repo's language convention, name these in English (`users`, `pets`, `services`, `medications`, `appointments`, `medical-records`, `schedules`) rather than the Spanish names used in this doc                                       |

---

## Phase 0 — Secrets & environment hygiene

- Resolve the blocking issue above.
- Cross-check `.env.example` lists every key in `env.d.ts`'s `FIREBASE_*` block plus `AUTH_SECRET`/`AUTH_DEBUG`.
- Confirm Firestore Security Rules (console-side, not this repo) deny all direct client access — the proposal's architecture requires **all** reads/writes to go through this backend, never a client SDK talking to Firestore directly.
- Acceptance: `pnpm build` succeeds locally with only `.env` (no JSON key file present).

## Phase 1 — Firebase Authentication swap (`auth.ts`, unblocks every protected module) — ✅ Done (2026-09-16)

> **Implementation note (supersedes the paragraph below):** rather than renaming `Role.USER|ADMIN|SUPER_ADMIN` to `Role.CLIENTE|EMPLEADO|ADMINISTRADOR`, the `Role` enum and `utils/role.ts`'s hierarchy were **removed entirely**. Authorization is now permissions-only: `constants/permission.ts`'s `Permission` enum (atomic `resource:action` constants) plus `utils/permission.ts`'s `hasPermission` set-membership check, mirroring `constants/route.ts`'s `requiredPermissions`, `app/api/_shared/http/handler.ts`'s `withAuth`, and `components/wrappers/next-auth-wrapper.tsx`'s `PermissionWrapper`/`AuthPermissionWrapper` (the old `RoleWrapper`/`AuthRoleWrapper`). A "role" (Cliente/Empleado/Administrador) is not a stored enum anywhere in app code — it's just a name for a group of permissions, administered in Firestore's `roles` collection and seeded via `scripts/seed/` (see `AGENTS.md`'s "Database Seeding" section). `docs/roadmap/frontend.md`'s references to `Role`/`RoleWrapper`/`allowedRoles` need the same update wherever those pages get built.
>
> The rest of this section (Firebase ID token verification, custom claims, bearer-token path) was implemented as described, substituting `permissions: Permission[]` wherever `role` is mentioned.

`constants/enum.ts` currently defines `Role.USER | Role.ADMIN | Role.SUPER_ADMIN` (template scaffold values) and `constants/route.ts`'s `protectedRoutes` / `utils/role.ts`'s `hasRequiredRole` hierarchy are built on them. The proposal defines four roles instead: **Visitante** (unauthenticated, not a stored role), **Cliente**, **Empleado**, **Administrador**. Rename/extend the enum to `Role.CLIENTE | Role.EMPLEADO | Role.ADMINISTRADOR` (or keep both if something else in the scaffold still depends on the old names — check `utils/role.ts`'s hierarchy order first, since it assumes `USER < ADMIN < SUPER_ADMIN`) before writing any module below; every `allowedRoles`/`RoleWrapper` reference in this roadmap uses the new names. This is a breaking rename — do it once, in its own commit, before Phase 2.

Replace the legacy `auth/login` REST call in `auth.ts`'s `authorize()` with `FirebaseAdminService.getInstance().getAuth()`:

- Client obtains a Firebase ID token via the Firebase Auth JS SDK (email/password, and later Google) — this happens in the frontend's login form (see frontend roadmap Phase 1) and is passed into the NextAuth `credentials` object instead of `identifier`/`password`.
- `authorize()` calls `auth.verifyIdToken(idToken)` to get the Firebase `uid` + custom claims.
- Store/read `role` as a **Firebase custom claim** (`auth.setCustomUserClaims(uid, { role })`), set once at registration (Phase 2's `usuarios` module) and refreshed on role changes by an admin.
- Keep everything downstream unchanged: `jwt`/`session` callbacks still copy `role` onto the NextAuth token/session (`next-auth.d.ts` types already support this), `cookies()` still set `jwt`/`refreshToken` if a bridging session cookie is wanted, `proxy.ts`'s `hasRequiredRole` gating is untouched.
- Add a `verifyFirebaseAuth` helper alongside `withAuth` in `app/api/_shared/http/handler.ts` (or extend `withAuth` itself) so API routes can verify the Firebase ID token sent in the `Authorization` header for calls originating from the future React Native app, independent of the NextAuth cookie session used by the web app. Both must resolve to the same `{ uid, role }` shape for a given user.
- Acceptance (as implemented): a route decorated with `withAuth(handler, [Permission.CONTACTS_READ])` correctly 401s an anonymous request, 403s a request with no matching permission, and 200s a request whose `permissions` claim includes it, for both the NextAuth-cookie path (web) and the bearer-token path (future mobile).

## Phase 2 — Firestore schema design + `usuarios`/roles

Write the schema note first (a short markdown table per collection: fields, types, indexes needed), then implement:

- **Collection `usuarios`**: `{ uid, name, email, phone, role: 'cliente'|'empleado'|'administrador', createdAt }`. Keyed by Firebase `uid` (not an auto-id), so `findById` doubles as "find by auth identity".
- Registration endpoint (`POST /api/usuarios`, public): creates the Firebase Auth user (`auth.createUser`) + the Firestore profile document in one service method, hashing is handled by Firebase Auth itself (no manual hashing needed — this satisfies the proposal's "password stored via hash functions" requirement for free).
- `PATCH /api/usuarios/[id]` (admin-only): role changes call `auth.setCustomUserClaims` **and** update the Firestore `role` field, in that order, inside a single service method so they can't drift.
- Acceptance: registering a user creates both the Auth user and Firestore doc; deleting either without the other never happens (wrap in a service-level compensating rollback if `createUser` succeeds but the Firestore write fails).

## Phase 3 — `mascotas` module (client-owned resource)

- **Collection `mascotas`**: `{ ownerId (usuarios.uid), name, species, breed, birthDate, notes, createdAt }`.
- `MascotaRepository.findByOwner(ownerId)` mirrors `ContactRepository.findByStatus`.
- Service enforces **tenant isolation**: a `Role.CLIENTE` caller may only `list`/`get`/`update`/`delete` mascotas where `ownerId === callerUid` (pulled from the verified token in Phase 1, never from the request body); `Role.ADMINISTRADOR`/`Role.EMPLEADO` bypass the filter. This is the same shape as the "never trust client-provided ownership" rule already in project conventions — bake the check into the service, not the controller.
- Routes: `GET/POST /api/mascotas`, `GET/PATCH/DELETE /api/mascotas/[id]`.
- Acceptance: client A cannot fetch client B's mascota by id (404, not 403 — avoid leaking existence).

## Phase 4 — `servicios` module (public catalog)

- **Collection `servicios`**: `{ name, description, durationMinutes, price, category, active, createdAt }`.
- `GET /api/servicios` is **public** (no `withAuth`) — satisfies "visitor browses the catalog without login."
- `POST`/`PATCH`/`DELETE` restricted to `Role.ADMINISTRADOR`.
- `durationMinutes` is the input the Citas module (Phase 5) uses to compute slot length — no duplication of that value elsewhere.
- Acceptance: an unauthenticated request can list active services; a `Role.CLIENTE` cannot mutate them.

## Phase 5 — `citas` module (highest-risk: overlap validation)

- **Collection `citas`**: `{ clientId, mascotaId, servicioId, staffId?, start, end, status: 'pendiente'|'confirmada'|'atendida'|'cancelada'|'no_asistio', createdAt }`. `end` is derived server-side from `start + servicio.durationMinutes`, never trusted from the client.
- Availability check before create/reschedule: query existing `citas` for the same time window (`where start < newEnd AND end > newStart`, excluding cancelled) and reject with a 409 on overlap. Firestore doesn't support that compound range query directly on two fields easily — either (a) narrow to same-day queries then filter overlap in application code (acceptable at this data volume), or (b) use the `realtime.repository.ts` scaffold to hold an in-memory day-view and validate against it. Pick (a) first — it's simpler and sufficient for a single clinic's daily volume; note (b) as a later optimization only if needed.
- Status transitions are a fixed state machine in the service (e.g. `pendiente → confirmada|cancelada`, `confirmada → atendida|cancelada|no_asistio`); reject invalid transitions with 422.
- Client-side actions (`create`, `cancel`) vs staff-side actions (`confirm`, `mark-attended`, `mark-no-show`, full-agenda list) are separate controller methods/routes, each with its own `allowedRoles` — don't let one generic `PATCH` accept every status value from every role.
- Routes: `GET/POST /api/citas` (client sees own, staff sees all via query param + role branch), `PATCH /api/citas/[id]/status`, `DELETE /api/citas/[id]` (client cancel only, before a cutoff).
- Acceptance: two concurrent create requests for the same overlapping slot — the second must fail with 409, not silently double-book.

## Phase 6 — `historiales` module + Storage

- **Collection `historiales`**: `{ mascotaId, staffId, date, diagnosis, treatment, notes, attachmentPaths: string[] }`.
- File upload flow: client requests a signed upload URL or uploads through the backend (`FirebaseAdminService.getInstance().getStorage()`), backend stores only the **Storage path** in `attachmentPaths`, never a public URL, and issues short-lived signed download URLs on read.
- Access restricted to the mascota's owner (client) and staff/admin — same ownership check pattern as Phase 3.
- Acceptance: a signed download URL for one client's attachment cannot be produced for a different client's request.

## Phase 7 — `medicamentos` + `pedidos` modules

- **Collection `medicamentos`**: `{ name, description, stock, price, active }` — CRUD mirrors `servicios` but stock decrements are transactional.
- **Collection `pedidos`**: `{ clientId, items: [{ medicamentoId, quantity }], status, createdAt }`. No payment gateway (explicitly out of scope) — `pedidos` just tracks reserved/fulfilled stock for in-store pickup.
- Stock decrement on order creation must be a Firestore transaction (`runTransaction`) to avoid overselling under concurrent orders — same class of bug as Phase 5's overlap check.
- Acceptance: two concurrent orders that would jointly exceed stock — only one succeeds.

## Phase 8 — `reportes` module (read-only aggregation)

- Endpoints: `GET /api/reportes/citas?from&to` (counts by status/day), `GET /api/reportes/servicios-populares`, `GET /api/reportes/inventario-rotacion`.
- These are aggregation queries over existing collections — no new collection. Given Firestore's limited aggregation support, compute in the service layer from `findMany` results rather than assuming Firestore-native aggregation pipelines exist for arbitrary group-bys.
- Admin-only.
- Acceptance: report numbers match a manual count against Firestore console data for a small fixture set.

## Phase 9 — Retire the legacy REST backend path

- Once Phases 1–2 are live, grep `lib/rest.ts`/`services/rest.service.tsx` call sites for anything still assuming the old external backend (the `auth/login` call is the only one confirmed so far) and either delete it or repoint it.
- Finish whatever the `chore: deprecation notice for proxy handler` commit started on `proxy.ts` — clarify the intended end state with whoever wrote that commit before changing routing behavior, since `proxy.ts` currently is the only enforcement point for `protectedRoutes`.
- Acceptance: no remaining code path in the repo depends on `NEXT_PUBLIC_API_URL` pointing at a non-Firebase backend, or that dependency is intentional and documented.
