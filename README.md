# DPS Vet Web

Web application for **Veterinaria San Roque**, built for the Universidad Don
Bosco course **Diseño y Programación de Software Multiplataforma (DPS941)**.
The application provides the clinic dashboard, authentication, veterinary
records, appointments, services, inventory, orders, users, and reports.

This repository is the web client and web/API application. The companion mobile
application is maintained separately.

## Phase 2 submission

The Phase 2 submission contains the following project information:

- Institution: Universidad Don Bosco
- Course: Diseño y Programación de Software Multiplataforma — DPS941
- Deliverable: Fase 2 del proyecto
- Students: Diana Raquel Cruz Cruz (CC253591) and Douglas Mauricio Cabrera
  Pineda (CP253590)
- Instructor: Alexander Sigüenza
- Date in the document: Sunday, September 20, 2026
- Web repository: <https://github.com/cabrera-evil/dps-vet-web>
- Mobile repository: <https://github.com/cabrera-evil/dps-vet-app>

The technical details below are documented from the source code in this
repository.

## Technology stack

- **Runtime:** Node.js 24.12.0 and pnpm 10.14.0
- **Framework:** Next.js 16.3.3 with the App Router and React 19.1.0
- **Language:** strict TypeScript 5.9
- **Styling/UI:** Tailwind CSS 4, shadcn/Base UI primitives, Lucide icons,
  `class-variance-authority`, `clsx`, and `tailwind-merge`
- **Authentication:** NextAuth 5 beta with JWT sessions and a credentials
  provider backed by Firebase Authentication
- **Database and storage:** Firebase Admin SDK, Firestore, Firebase Storage,
  and Firebase Realtime Database configuration
- **Data access:** Axios REST client, TanStack React Query, TanStack Table,
  and Socket.IO client support
- **Forms and validation:** React Hook Form with Zod schemas and the Zod
  resolver
- **Monitoring:** Sentry for Next.js, plus optional Google Analytics and
  Google AdSense providers
- **Quality and delivery:** ESLint, Prettier, Husky, lint-staged, Commitlint,
  and Semantic Release

## Requirements

- Node.js `24.12.0` (the version declared by `package.json`)
- pnpm `10.14.0`
- A Firebase project with Authentication, Firestore, and Storage configured
- Environment variables described in `.env.example`

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open <http://localhost:3000> after the development server starts. Edit `.env`
with the Firebase, authentication, API, and optional monitoring values required
by the environment. Never commit `.env`, service-account credentials, private
keys, or administrator passwords.

### Environment configuration

`.env.example` is the source of the local configuration contract. The main
groups are:

| Group | Variables | Purpose |
| --- | --- | --- |
| API/proxy | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PROXY`, `NEXT_PUBLIC_HOST` | REST client base URL and optional proxy behavior |
| Auth | `AUTH_SECRET`, `AUTH_DEBUG` | NextAuth JWT signing and development diagnostics |
| Firebase Admin | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Server-side Admin SDK credentials |
| Firebase services | `FIREBASE_STORAGE_BUCKET`, `FIREBASE_DATABASE_URL`, `FIREBASE_WEB_API_KEY` | Storage, Realtime Database, and server-side identity APIs |
| Seed administrator | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` | Optional account used only by the seed command |
| Observability | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_PROJECT`, `SENTRY_ORG` | Sentry error reporting and source-map configuration |
| Analytics/ads | `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`, `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`, `NEXT_PUBLIC_GOOGLE_SITES_VERIFICATION` | Optional browser integrations |

Variables containing Firebase Admin credentials are server-only and must not
be renamed with the `NEXT_PUBLIC_` prefix.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js with Turbopack |
| `pnpm build` | Remove the previous `.next` directory and create a production build |
| `pnpm start` | Serve the production build |
| `pnpm check-types` | Run TypeScript without emitting files |
| `pnpm lint:check` | Run ESLint without modifying files |
| `pnpm format:check` | Verify Prettier formatting |
| `pnpm lint` | Run ESLint with its configured fix behavior |
| `pnpm format` | Format repository files with Prettier |
| `pnpm db:seed` | Seed permissions, roles, and the optional administrator |
| `pnpm db:migrate` | Deploy the configured Firestore indexes |

The database commands require a correctly configured Firebase environment and
can change remote project state. Review the target project before running them.
There is no dedicated test runner configured at present.

## Project structure

```text
app/
├── (auth)/auth/              Login, registration, and password flows
├── (dashboard)/dashboard/    Authenticated dashboard pages
├── (static)/                 Public landing page
├── api/                      Next.js route handlers and backend modules
├── layout.tsx                Root metadata, font, styles, and providers
└── global-error.tsx          Global error handling
components/                   Feature UI, layouts, tables, forms, and wrappers
constants/                    Permissions, routes, enums, defaults, and tables
hooks/                        Reusable client hooks
layouts/                      Shared layout helpers
lib/                          Small shared libraries and REST facade
providers/                    Theme, auth, query, toast, analytics, and ads
schemas/                      Shared Zod form schemas
services/                     REST and Socket.IO client services
scripts/seed/                 Firestore catalog and administrator seeders
scripts/migrate/              Firestore index deployment scripts
types/                        Shared TypeScript contracts
utils/                        General helpers and permission checks
public/                       Static assets
docs/                         Roadmaps and the Phase 2 document
```

Route groups in parentheses organize pages without adding those group names to
the URL. The current user-facing routes include `/auth/login`,
`/auth/register`, `/auth/forgot-password`, `/auth/reset-password`,
`/dashboard`, `/dashboard/appointments`, `/dashboard/clients`,
`/dashboard/inventory`, `/dashboard/patients`, and `/dashboard/services`.

## How the application works

### Rendering and providers

`app/layout.tsx` is the root layout. It loads the Geist font, global CSS, and
the provider tree from `providers/providers.tsx`. The provider tree supplies:

- NextAuth session state through `AuthProvider`.
- TanStack Query caching, streamed hydration, and development tools.
- Theme switching through `next-themes`.
- URL state parsing through `nuqs`.
- Tooltips, toast notifications, Google Analytics, and Google AdSense.

Feature pages are composed from `components/` and the generated UI primitives
under `components/ui/`. New feature UI should reuse those existing patterns.

### Authentication and authorization

The browser signs in through NextAuth's credentials provider. The provider
delegates identity verification to the Firebase login service. NextAuth stores a
JWT session containing the Firebase `uid` and a flat `permissions` array.

Authorization is permission-based; there is no role hierarchy in application
code. A role is a named group of permissions stored in Firestore. The same
permission model is checked in three places:

1. `proxy.ts` redirects unauthenticated users and users without permissions on
   protected page routes.
2. `components/wrappers/next-auth-wrapper.tsx` controls client-side UI access.
3. API handlers use `withAuth` from `app/api/_shared/http/handler.ts`.

API authentication accepts either the NextAuth session cookie for the web app
or an `Authorization: Bearer <firebase-id-token>` header for future clients
such as the companion mobile application.

### API architecture

Each domain under `app/api/` is organized as a vertical slice:

```text
domain/
├── *.schema.ts       Zod input validation and domain types
├── *.types.ts        Response and contract types
├── *.repository.ts   Firestore persistence
├── *.service.ts      Domain rules and authorization-aware operations
├── *.controller.ts   Request parsing and response shaping
├── *.module.ts       Dependency wiring
└── route.ts          Next.js route handler
```

The shared HTTP layer normalizes errors and composes handlers as
`withRoute(withAuth(handler, permissions))`. The shared repository layer
provides typed Firestore CRUD operations, query filters, ordering, pagination,
and Firebase error mapping.

Implemented API domains include users, contacts, pets, services, appointments,
medical records, medications, orders, and reports. Authentication also has
login, password reset, and forgot-password handlers. Report endpoints require
bounded date ranges, while domain services enforce ownership and business rules
on the server.

Important examples of server-side rules include:

- Clients can only access their own pets, appointments, and medical records
  unless their permissions allow management of all records.
- Appointment end times are derived from the selected service duration.
- Appointment overlap checks use Firestore transactions and day-lock
  documents.
- Appointment status changes follow a fixed state machine.
- Medical-record attachments persist Storage paths and are served through
  short-lived signed URLs rather than public URLs.
- Order stock changes are transactional and aggregate repeated medication line
  items before checking or decrementing stock.

### Client data access

`services/rest.service.tsx` owns the Axios instance, credentials, error toasts,
and retry/refresh handling. `lib/rest.ts` exposes small typed CRUD helpers on
top of that service. The base URL is controlled by `NEXT_PUBLIC_API_URL`; the
Next.js rewrite configuration can proxy API requests when that variable is set.

The repository is transitioning from the legacy external REST backend to the
Firebase-backed handlers under `app/api/**`. Keep this boundary documented and
stable because the mobile repository consumes the REST contract.

## Firestore data and seed workflow

Canonical permission and role data lives under `scripts/seed/catalog/`. The
seeders in `scripts/seed/seeders/` implement an idempotent seed contract, and
`scripts/seed/index.ts` executes them in dependency order. Permissions are
seeded before roles; the optional administrator seeder runs after both.

`firestore.indexes.json` contains the composite indexes needed by filtered
queries. The migration script deploys those indexes through the Google Cloud
Firestore Admin API using the configured service-account credentials. Do not
edit generated clients or store Firebase service-account JSON files in the
repository.

## Production and Docker

For non-Vercel builds, `next.config.ts` enables Next.js `standalone` output.
When `VERCEL` is set, the default Vercel output is preserved. Sentry wraps the
Next.js configuration and can upload source maps in CI.

The `Dockerfile` is a three-stage build:

1. Install dependencies from the available lockfile, preferring pnpm for this
   repository.
2. Build the standalone Next.js application.
3. Run the minimal standalone server as the non-root `node` user on port 3000.

Example:

```bash
docker build -t dps-vet-web .
docker run --env-file .env -p 3000:3000 dps-vet-web
```

Set all required runtime environment variables in the deployment platform;
local `.env` values are not copied into the image.

## Validation before delivery

Run the narrow checks first, then the production build:

```bash
pnpm check-types
pnpm lint:check
pnpm format:check
pnpm build
```

These checks validate static correctness and the build only. They do not prove
that Firebase credentials, Firestore indexes, Storage rules, deployed API
routes, or the Vercel environment are configured correctly. Those require a
separate deployment and live smoke test.

## Related documentation

- [`docs/roadmap.md`](docs/roadmap.md) — Firebase integration roadmap
- [`docs/roadmap/frontend.md`](docs/roadmap/frontend.md) — frontend roadmap
- [`docs/roadmap/backend.md`](docs/roadmap/backend.md) — API/backend roadmap
