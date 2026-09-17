# Frontend Roadmap — Firebase Integration (`app/**` UI)

Companion to `docs/roadmap/backend.md`; each phase here depends on the matching backend phase (noted per section) being live, since there is no separate mock layer — `hooks/use-rest.tsx` calls the real API routes. Source of requirements: `docs/course/DPS941/Tasks/Phase-01/Proyecto de Catedra DPS.md`.

No new data-fetching, auth-gating, forms, or table pattern is introduced anywhere below — every phase reuses what's already in the repo:

- **Data fetching**: `hooks/use-rest.tsx` (`useGet`, `usePost`, `usePatch`, `useDelete`, `useInfiniteGet`) — query keys are `[path, requestParams]`, mutations return the created/updated record.
- **List pages**: `hooks/use-data-table.ts` + `components/table/*` (`data-table.tsx`, pagination, faceted filter, column header, view options) — binds TanStack Table to URL params via `nuqs`, encodes filters as a rison `q` param matching the backend's `FindManyArgs`-style query schemas (see `contact.schema.ts`'s `listContactsQuerySchema` as the shape every list endpoint below should mirror).
- **Auth gating**: `components/wrappers/next-auth-wrapper.tsx` (`AuthWrapper`, `PermissionWrapper`, `AuthPermissionWrapper`) for client components; `proxy.ts` + `constants/route.ts`'s `protectedRoutes` for route-level redirects.
- **Forms**: `schemas/*.ts` (zod) already holds `login.schema.ts`, `forgot-password.schema.ts`, `reset-password.schema.ts`, `user.schema.ts` — new forms add a sibling schema file, not a new validation approach.
- **Styling**: Tailwind + `components/ui/**` (generated shadcn, `base-nova` style) — do not hand-edit `components/ui`; compose from it.

## ✅ Progress Checklist

- [ ] **Phase 0** — Replace scaffold placeholders
- [ ] **Phase 1** — Auth pages (`/auth/login`, `/auth/register`) — blocked on backend Phase 2 (`usuarios`); backend Phase 1 (Firebase Auth swap) is done, see the note below
- [ ] **Phase 2** — Catálogo público
- [ ] **Phase 3** — Cliente: Mascotas + Agenda de Citas
- [ ] **Phase 4** — Panel de Administración shell
- [ ] **Phase 5** — Historiales clínicos UI
- [ ] **Phase 6** — Inventario y Pedidos screens
- [ ] **Phase 7** — Reportes
- [ ] **Phase 8** — Etapa 2 deploy checkpoint

No frontend phase has started yet — none of the pages/components below exist. This checklist mirrors `docs/roadmap/backend.md`'s.

## ⚠ Prerequisite from the backend side — updated 2026-09-16

Backend Phase 1 landed, but **not** as originally described here: instead of renaming `Role` to `CLIENTE|EMPLEADO|ADMINISTRADOR`, the `Role` enum was **removed entirely**. Authorization is now permissions-only:

- `components/wrappers/next-auth-wrapper.tsx` no longer exports `RoleWrapper`/`AuthRoleWrapper` — it exports `PermissionWrapper`/`AuthPermissionWrapper`, taking `permissions: Permission[]` (from `constants/permission.ts`) and an optional `mode: 'any' | 'all'`, not `roles: Role[]`.
- `constants/route.ts`'s `protectedRoutes` entries use `requiredPermissions: Permission[]`, not `allowedRoles: Role[]`.
- `session.user`/the NextAuth JWT carry `permissions: Permission[]` (and `uid: string`), not `role`.
- Every `RoleWrapper roles={[...]}`/`allowedRoles`/`session.user.role` reference below and in `docs/roadmap/backend.md` needs the same substitution when that page/phase is actually built — treat any leftover `Role` mention in either roadmap doc as stale, not authoritative.
- A "role" (Cliente/Empleado/Administrador) still exists conceptually — it's just a named group of permissions administered in Firestore (`roles` collection, seeded via `scripts/seed/`), not a frontend enum or hierarchy.

## Deadlines

| Date          | Deliverable                               | Frontend must have                                                                                                                                        |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-20    | Etapa 2 — partial web delivery            | Phases 0–3 at minimum: real login, public catalog, one full client flow (mascotas + book a cita)                                                          |
| 2026-09-21/25 | Defense of Etapa 2                        | The above must run live against the deployed Vercel URL, not just locally                                                                                 |
| 2026-11-08    | React Native gets Firebase Auth/Firestore | No direct dependency, but any UX decision made here (e.g. booking flow shape) is worth keeping consistent with what the mobile app will need to replicate |
| 2026-11-22    | Final delivery                            | All phases below                                                                                                                                          |

## Current state (verified 2026-09-16)

- `app/layout.tsx` metadata, `app/(static)/page.tsx`, and the error pages are still the scaffold's placeholders ("Create Next App", generic 400/404) — noted as a known TODO in `CLAUDE.md`.
- `app/(error)/unauthorized/page.tsx` exists (used by `proxy.ts`'s redirect).
- No `/auth/login`, `/auth/register`, `/admin/*`, or any domain page exists yet.
- `components/wrappers/next-auth-wrapper.tsx`, `hooks/use-rest.tsx`, `hooks/use-data-table.ts`, `components/table/*` are all implemented and unused so far (no consumer pages).
- No charting library is installed — needed by Phase 6 (Reportes); confirm one before that phase.

---

## Phase 0 — Replace scaffold placeholders

- `app/layout.tsx`: real `metadata` (title "Veterinaria San Roque", description, icons) instead of "Create Next App".
- `app/(static)/page.tsx`: becomes the actual landing page once Phase 1's catalog exists, or a temporary "Veterinaria San Roque" hero if sequencing requires something live sooner.
- `app/global-error.tsx` / `app/not-found.tsx` / `app/(error)/unauthorized/page.tsx`: replace generic template copy with clinic-branded messaging; keep the existing component structure.
- Acceptance: no page in the app still says "Create Next App" or "400 Bad Request".

## Phase 1 — Auth pages (`/auth/login`, `/auth/register`)

Depends on backend Phase 1 (Firebase Auth swap) and Phase 2 (`usuarios` registration endpoint).

- `app/(auth)/auth/login/page.tsx`: form using a new `schemas/login.schema.ts`-style zod schema (email + password) — reuse the existing `login.schema.ts` if its shape already matches, extend if not. On submit: call the Firebase Auth JS SDK client-side to sign in, obtain the ID token, then call NextAuth's `signIn('credentials', { idToken })` (the `authorize()` in `auth.ts` now expects an ID token per backend Phase 1, not identifier/password).
- `app/(auth)/auth/register/page.tsx`: form (name, email, phone, password) posting to the backend's public `POST /api/usuarios` (backend Phase 2) via `usePost` from `hooks/use-rest.tsx`, then auto-login on success.
- Route grouping: since `authRoutes = ['/auth/*']` in `constants/route.ts` already redirects authenticated users away from anything under `/auth`, put both pages under an `(auth)` segment matching that path, consistent with how `(error)`/`(static)` are already grouped.
- States to cover explicitly (per repo conventions): loading (submit button disabled + spinner), error (invalid credentials / email already registered — surfaced via the existing `sonner` toast pattern from `RestService`'s interceptor, or a form-level error if it's a validation failure), empty is N/A for a form.
- Acceptance: registering then logging in lands on `/` with a valid session; `useSession()` reflects the correct role from the custom claim.

## Phase 2 — Catálogo público (unauthenticated)

Depends on backend Phase 4 (`servicios`, public `GET`).

- `app/(static)/servicios/page.tsx` (or fold into the landing page if the design calls for a single scrollable page): lists active services via `useGet` against `/api/servicios`, no auth wrapper needed since the route itself is public.
- Card/list layout using existing UI primitives (`components/ui`) — name, description, duration, price per the proposal's "Servicios" module description.
- No login prompt anywhere on this page — the proposal is explicit that browsing requires zero friction; the login prompt only appears when the visitor tries to book (Phase 3).
- Acceptance: an incognito/unauthenticated session can view the full catalog with no redirect.

## Phase 3 — Cliente: Mascotas + Agenda de Citas

Depends on backend Phase 3 (`mascotas`) and Phase 5 (`citas`, overlap validation).

- `app/(client)/mascotas/page.tsx`: list + create/edit/delete for the signed-in client's own pets, wrapped in `AuthWrapper` (any authenticated role can reach this, but the backend service already restricts data to `ownerId === callerUid`). Use `useGet`/`usePost`/`usePatch`/`useDelete` directly — this is a small, non-paginated list, so `use-data-table` is likely overkill here; reserve that hook for the admin-side lists in Phase 4.
- `app/(client)/citas/page.tsx`: booking flow — pick mascota → pick servicio → calendar view of available slots → confirm. The "validate disponibilidad en tiempo real" requirement from the proposal means this UI should re-check availability right before submit (or optimistically submit and handle the backend's 409 from an overlap, showing "ese horario ya no está disponible, elige otro").
- Cancel action calls `useDelete`/`usePatch` against the backend's cancel endpoint (backend Phase 5); reflect the five statuses (`pendiente`, `confirmada`, `atendida`, `cancelada`, `no_asistio`) as a status badge, not free text.
- Gating: the booking action itself (not the page) is what should trigger the login prompt if reached from Phase 2's public catalog — e.g. a "book this service" CTA on the public page redirects to `/auth/login?callbackUrl=/citas`.
- Acceptance: booking an overlapping slot shows a clear inline error, not a generic failure toast; a client cannot see another client's mascotas or citas anywhere in this UI (this should already be true because the backend filters by `ownerId`/`clientId`, but verify no id is ever taken from a URL param without a corresponding backend check).

## Phase 4 — Panel de Administración shell (`/admin/*`)

Depends on backend Phases 2–5 (all admin-facing CRUD). `constants/route.ts`'s `protectedRoutes` already gates `/admin/*` — update its `requiredPermissions` to whichever `Permission` values the admin shell should require (e.g. the permissions granted to Empleado/Administrador in Firestore's `roles` collection, not a role name), or split into separate entries if some sub-routes need a narrower permission set (e.g. only an Administrador-only permission for `/admin/usuarios`).

- `app/(admin)/admin/agenda/page.tsx`: daily/weekly calendar view of all citas (not just the caller's), status-change actions (confirm/mark attended/mark no-show) restricted per backend Phase 5's per-action roles.
- `app/(admin)/admin/clientes/page.tsx`: list of clientes + their mascotas, using `use-data-table` + `components/table/data-table.tsx` for pagination/filtering (mirrors how a `contacts` admin list would look, once one exists — same list/filter/sort UX).
- `app/(admin)/admin/servicios/page.tsx` and `app/(admin)/admin/medicamentos/page.tsx`: CRUD tables for the catalog, admin-only mutations per backend Phases 4 and 7.
- `app/(admin)/admin/usuarios/page.tsx` (Administrador only): role management, calling the backend's role-change endpoint (backend Phase 2).
- Navigation shell: a layout (`app/(admin)/admin/layout.tsx`) with sidebar/nav wrapping all the above, gated with `AuthPermissionWrapper` at the layout level so individual pages don't repeat the check (defense in depth: `proxy.ts` already blocks the route server-side; the client wrapper is the UX-level empty/fallback state, not the security boundary).
- Acceptance: an Empleado can reach `/admin/agenda` but not `/admin/usuarios` (if scoped that way); an unauthenticated visit to any `/admin/*` path redirects to `/auth/login` before any admin UI flashes.

## Phase 5 — Historiales clínicos UI

Depends on backend Phase 6 (`historiales` + Storage signed URLs).

- Per-mascota history view (`app/(admin)/admin/clientes/[id]/mascotas/[petId]/historial/page.tsx` for staff, plus a read-only client-facing equivalent under `app/(client)/mascotas/[id]/historial/page.tsx`): list of entries (date, diagnosis, treatment, notes) with an image/file gallery.
- Upload UI (staff-only) posts to the backend's Storage-backed endpoint; render attached images/files via the short-lived signed URLs the backend returns — never construct a Storage URL client-side.
- Loading/empty states matter here specifically: "no clinical history yet" is a normal, expected state for a new pet, not an error.
- Acceptance: a client can view but not edit their own pet's history; uploading an image and reloading the page shows it without a stale/broken link (signed URLs expiring mid-session is a real risk — surface a retry affordance if an image fails to load).

## Phase 6 — Inventario y Pedidos screens

Depends on backend Phase 7.

- `app/(admin)/admin/inventario/page.tsx`: stock table (admin-only), reuse `use-data-table` pattern from Phase 4.
- `app/(admin)/admin/pedidos/page.tsx`: order list + status, staff can mark fulfilled (in-store pickup, no payment gateway per scope).
- Acceptance: stock displayed matches backend state after a concurrent-order test (see backend Phase 7's transactional acceptance criterion) — i.e. the UI never shows negative stock.

## Phase 7 — Reportes

Depends on backend Phase 8.

- **Decision needed before starting**: no charting library is installed yet. Pick one consistent with the existing Tailwind/shadcn setup (e.g. `recharts`, which shadcn's own chart components are typically built on) rather than introducing an unrelated dependency — confirm with whoever owns the design system choice before adding it to `package.json`.
- `app/(admin)/admin/reportes/page.tsx`: charts for citas-by-period, top servicios, inventory rotation, each backed by the corresponding backend Phase 8 endpoint via `useGet`.
- Acceptance: charts render with the small fixture dataset used to validate the backend reports, and show an explicit empty state (not a broken chart) when a date range has no data.

## Phase 8 — Etapa 2 deploy checkpoint (2026-09-20)

- Confirm every key in `env.d.ts` (`FIREBASE_*`, `AUTH_SECRET`, `NEXT_PUBLIC_*`, Sentry/Analytics keys) is set in Vercel for the target environment, not just `.env` locally.
- `pnpm check-types`, `pnpm lint:check`, `pnpm format:check`, and `pnpm build` all pass on the deploy branch.
- Manually walk the golden path once against the deployed URL: browse catálogo (unauthenticated) → register → login → add a mascota → book a cita → see it appear (as staff) in `/admin/agenda`. This is the flow most likely to be demoed live at the 2026-09-21/25 defense.
- README updated to reflect what's actually delivered at this stage (avoid overclaiming completed modules).

## Out of scope here

- The React Native mobile app (Etapa 3, due 2026-11-08 for the Firebase milestone) is a separate codebase — none of the phases above build mobile screens. Keep the REST contract (backend roadmap) stable enough that it doesn't need to change once mobile starts consuming it.
- Payment gateway UI, e-invoicing UI — explicitly excluded from v1 per the proposal.
