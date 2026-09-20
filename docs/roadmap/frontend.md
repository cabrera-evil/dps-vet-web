# Frontend Roadmap — Firebase Integration (`app/**` UI)

Companion to `docs/roadmap/backend.md`; each phase depends on the matching backend phase being live — there is no mock layer, `hooks/use-rest.tsx` calls the real API routes. Source of requirements: `docs/course/DPS941/Tasks/Phase-01/Proyecto de Catedra DPS.md`.

No new data-fetching, auth-gating, forms, or table pattern is introduced anywhere below — every phase reuses what's already in the repo:

- **Data fetching**: `hooks/use-rest.tsx` (`useGet`, `usePost`, `usePatch`, `useDelete`, `useInfiniteGet`) — query keys are `[path, requestParams]`.
- **List pages**: `hooks/use-data-table.ts` + `components/table/*` — binds TanStack Table to URL params via `nuqs`, encodes filters as a rison `q` param matching the backend's `FindManyArgs`-style query schemas.
- **Auth gating**: `components/wrappers/next-auth-wrapper.tsx` (`AuthWrapper`, `PermissionWrapper`, `AuthPermissionWrapper`) for client components; `proxy.ts` + `constants/route.ts`'s `protectedRoutes` for route-level redirects.
- **Forms**: `schemas/*.ts` (zod) — new forms add a sibling schema file.
- **Styling**: Tailwind + `components/ui/**` (generated shadcn) — do not hand-edit `components/ui`.

## Progress Checklist

- [ ] Phase 0 — Replace scaffold placeholders
- [ ] Phase 1 — Auth pages — blocked on backend Phase 2, which is done
- [ ] Phase 2 — Catálogo público
- [ ] Phase 3 — Cliente: Mascotas + Agenda de Citas
- [ ] Phase 4 — Panel de Administración shell
- [ ] Phase 5 — Historiales clínicos UI
- [ ] Phase 6 — Inventario y Pedidos screens
- [ ] Phase 7 — Reportes
- [ ] Phase 8 — Etapa 2 deploy checkpoint

No frontend phase has started; none of the pages/components below exist.

## Backend prerequisite — read before starting any phase

Backend Phase 1 removed the `Role` enum entirely; authorization is permissions-only. Every `Role`/`RoleWrapper`/`allowedRoles`/`session.user.role` reference below is stale:

- `next-auth-wrapper.tsx` exports `PermissionWrapper`/`AuthPermissionWrapper`, taking `permissions: Permission[]` (`constants/permission.ts`) and an optional `mode: 'any' | 'all'`, not `roles: Role[]`.
- `constants/route.ts`'s `protectedRoutes` entries use `requiredPermissions: Permission[]`.
- `session.user`/the NextAuth JWT carry `permissions: Permission[]` and `uid: string`, not `role`.
- Backend collection/route names are English (`users`, `pets`, `services`, `appointments`, `medical-records`, `medications`, `orders`) — the Spanish names below (`mascotas`, `citas`, `servicios`, etc.) are stale.
- A "role" still exists conceptually as a named permission group administered in Firestore's `roles` collection, not a frontend enum.

## Deadlines

| Date          | Deliverable                     | Frontend must have                                                            |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| 2026-09-20    | Etapa 2 partial web delivery    | Phases 0–3: real login, public catalog, one full client flow                  |
| 2026-09-21/25 | Defense of Etapa 2              | Running live against the deployed Vercel URL, not just locally                |
| 2026-11-08    | React Native gets Firebase Auth | No direct dependency; keep booking-flow UX consistent for mobile to replicate |
| 2026-11-22    | Final delivery                  | All phases                                                                    |

## Current state

- `app/layout.tsx`, `app/(static)/page.tsx`, and the error pages are still scaffold placeholders.
- `app/(error)/unauthorized/page.tsx` exists (used by `proxy.ts`'s redirect).
- No `/auth/login`, `/auth/register`, `/admin/*`, or domain page exists yet.
- `next-auth-wrapper.tsx`, `use-rest.tsx`, `use-data-table.ts`, `components/table/*` are implemented but have no consumer pages.
- No charting library installed — needed by Phase 7.

---

## Phase 0 — Replace scaffold placeholders

- `app/layout.tsx`: real metadata (title, description, icons).
- `app/(static)/page.tsx`: landing page, or a temporary hero if the catalog isn't ready yet.
- Error pages: clinic-branded messaging, same component structure.
- Acceptance: no page says "Create Next App" or "400 Bad Request".

## Phase 1 — Auth pages (`/auth/login`, `/auth/register`)

Depends on backend Phases 1–2.

- `app/(auth)/auth/login/page.tsx`: email + password form. On submit: sign in via the Firebase Auth JS SDK client-side, get the ID token, call `signIn('credentials', { idToken })`.
- `app/(auth)/auth/register/page.tsx`: name/email/phone/password form posting to `POST /api/users`, auto-login on success.
- Group both under `(auth)`, matching `authRoutes = ['/auth/*']`.
- Cover loading (disabled submit + spinner) and error (invalid credentials / already registered, via the `sonner` toast pattern) states.
- Acceptance: register then login lands on `/` with a valid session; `useSession()` reflects the correct permissions.

## Phase 2 — Catálogo público (unauthenticated)

Depends on backend Phase 4.

- Lists active services via `useGet` against `/api/services`, no auth wrapper.
- Card/list layout with `components/ui` primitives: name, description, duration, price.
- No login prompt on this page — only when booking (Phase 3).
- Acceptance: an unauthenticated session views the full catalog with no redirect.

## Phase 3 — Cliente: Mascotas + Agenda de Citas

Depends on backend Phases 3 and 5.

- `app/(client)/mascotas/page.tsx`: list/create/edit/delete for the signed-in client's own pets, wrapped in `AuthWrapper` (backend already restricts data to `ownerId === callerUid`); direct `useGet`/`usePost`/`usePatch`/`useDelete` is enough, `use-data-table` is overkill for this small list.
- `app/(client)/citas/page.tsx`: pick pet → service → available slot → confirm; re-check availability before submit or handle the backend's 409 with an inline "that slot is no longer available" message.
- Cancel calls the backend's cancel endpoint; show status (`PENDING`, `CONFIRMED`, `ATTENDED`, `CANCELLED`, `NO_SHOW`) as a badge.
- The booking CTA (not the page) triggers the login prompt when reached from the public catalog.
- Acceptance: booking an overlapping slot shows a clear inline error; a client never sees another client's data anywhere in this UI.

## Phase 4 — Panel de Administración shell (`/admin/*`)

Depends on backend Phases 2–5. `constants/route.ts`'s `protectedRoutes` already gates `/admin/*` — set its `requiredPermissions` per sub-route.

- `app/(admin)/admin/agenda/page.tsx`: calendar view of all appointments, confirm/attend/no-show actions.
- `app/(admin)/admin/clientes/page.tsx`: client + pet list via `use-data-table`.
- `app/(admin)/admin/servicios/page.tsx`, `app/(admin)/admin/medicamentos/page.tsx`: catalog CRUD tables.
- `app/(admin)/admin/usuarios/page.tsx` (Administrador only): role management.
- `app/(admin)/admin/layout.tsx`: nav shell gated with `AuthPermissionWrapper` (UX fallback only — `proxy.ts` is the actual security boundary).
- Acceptance: an Empleado can reach `/admin/agenda` but not `/admin/usuarios`; an unauthenticated visit redirects to `/auth/login` before any admin UI flashes.

## Phase 5 — Historiales clínicos UI

Depends on backend Phase 6.

- Per-pet history view for staff, plus a read-only client-facing equivalent: entries (date, diagnosis, treatment, notes) with a file gallery.
- Staff-only upload UI; render attachments via the backend's signed URLs, never construct a Storage URL client-side.
- "No clinical history yet" is a normal empty state, not an error.
- Acceptance: a client can view but not edit their own pet's history; uploads persist across reload; a retry affordance covers expired signed URLs.

## Phase 6 — Inventario y Pedidos screens

Depends on backend Phase 7.

- `app/(admin)/admin/inventario/page.tsx`: stock table (admin-only), `use-data-table` pattern.
- `app/(admin)/admin/pedidos/page.tsx`: order list + status; staff marks fulfilled.
- Acceptance: stock shown never goes negative under a concurrent-order test.

## Phase 7 — Reportes

Depends on backend Phase 8.

- Pick a charting library consistent with Tailwind/shadcn (e.g. `recharts`) before starting.
- `app/(admin)/admin/reportes/page.tsx`: charts for appointments-by-period, top services, inventory turnover.
- Acceptance: charts render against the backend's fixture data; an explicit empty state for date ranges with no data.

## Phase 8 — Etapa 2 deploy checkpoint (2026-09-20)

- Every key in `env.d.ts` set in Vercel, not just `.env` locally.
- `pnpm check-types`, `lint:check`, `format:check`, `build` all pass on the deploy branch.
- Manual golden-path walk against the deployed URL: browse catalog → register → login → add a pet → book an appointment → see it in `/admin/agenda`.
- README reflects what's actually delivered.

## Out of scope

- The React Native mobile app (Etapa 3, 2026-11-08) is a separate codebase — keep the REST contract stable for it to consume.
- Payment gateway UI, e-invoicing UI — excluded from v1.
