# Sensor2AI Labs

A production-grade, fully static, SEO-optimized website for Sensor2AI Labs, an IIT Patna
professor's research lab, built with the Next.js App Router. The design is formal and academic with a modern,
animated feel and a white / near-black / orange palette.

> Content is professional **placeholder** data for now. It lives in typed files under
> `src/data/` so real lab content can be swapped in later without touching components. The
> reference for structure and layout was https://ubisysResearch.github.io/ (an IIT Jodhpur
> lab); this project copies neither its content nor its exact styling.

## Tech stack

- **Next.js 16.2.10** (App Router, Turbopack). `16.2.10` is the pinned version; it is the
  current `latest` on npm.
- **React 19** (bundled with Next 16).
- **TypeScript** in strict mode (`noUncheckedIndexedAccess` on), no `any`.
- **Tailwind CSS v4** (CSS-first `@theme`). Every color resolves to a CSS variable; no raw
  hex appears outside `src/app/globals.css`.
- **Motion** (`motion/react`, the Framer Motion package) via `LazyMotion` + `domAnimation`
  and `MotionConfig reducedMotion="user"` so the bundle stays small and honors reduced motion.
- **lucide-react** for all icons (SVG only, no emoji).
- **next/font** (self-hosted Space Grotesk + Inter, no runtime CDN calls).
- ESLint (flat config) + Prettier, both passing.
- **Playwright** + **@axe-core/playwright** for end-to-end and accessibility tests.

The same Next.js app also ships a full backend as App Router **Route Handlers** under
`src/app/api/v1/**` (see [Backend](#backend-api-and-database)):

- **PostgreSQL** via **Prisma 7** with the `@prisma/adapter-pg` driver adapter.
- Custom **JWT** auth (`jose`, HS256) with rotating, reuse-detecting refresh tokens and
  **argon2id** password hashing (`@node-rs/argon2`).
- **Zod** request validation, cursor pagination, Postgres **full-text search** for
  publications, and BibTeX import (`@retorquere/bibtex-parser`).
- Applicants share a resume **link** (e.g. Google Drive, view access) rather than uploading a
  file, so there is no storage to manage.
- No email service: admin actions return a drafted email the admin sends from their own
  inbox via a `mailto:` popup.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

### Scripts

| Script                 | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the dev server                                  |
| `npm run build`        | Production build (static)                             |
| `npm run start`        | Serve the production build                            |
| `npm run lint`         | ESLint                                                |
| `npm run typecheck`    | `tsc --noEmit`                                        |
| `npm run format`       | Prettier write                                        |
| `npm run format:check` | Prettier check                                        |
| `npm run test:e2e`     | Playwright suite (builds server, smoke + a11y + UI)   |
| `npm run db:migrate`   | Apply/author migrations in dev (`prisma migrate dev`) |
| `npm run db:deploy`    | Apply migrations in CI/prod (`prisma migrate deploy`) |
| `npm run db:generate`  | Regenerate the Prisma client                          |
| `npm run db:studio`    | Open Prisma Studio                                    |
| `npm run seed:admin`   | Create/promote the first admin user                   |

Before the first test run, install the browser once: `npx playwright install chromium`.

## Project structure

```
src/
  app/            # routes, layout, globals.css, sitemap, robots, not-found, loading
  components/
    layout/       # Header, Footer, MobileMenu, NavLink, Logo, PageHeader
    ui/           # Button, Badge, Chip, Pill, Card, Section, Container, Tabs, Stat, ...
    motion/       # MotionProvider, Reveal, Stagger
    home/         # Hero, NewsCarousel, Achievements, ResearchAreas, LabStats, ...
    team/ publications/ projects/ news/ join/ seo/
  data/           # all page content as typed data (swap these for real content)
  lib/            # cn, initials, motion constants
  types/          # shared TypeScript types
```

## Content: swapping placeholder for real data

All copy lives in `src/data/`. To go live, edit these files; components and types stay the same:

- `site.ts` covers lab name, PI, contact email, and social links.
- `team.ts` covers current team and alumni (add `image` paths under `public/assets/` to replace
  the monogram avatars).
- `publications.ts`, `projects.ts`, `news.ts`, `Research-areas.ts`,
  `stats.ts`, `collaborators.ts`, `sponsors.ts`, `about.ts`.

The Join page has no static content: openings come live from the API, driven by what admins post
from the review console.

## Design tokens

All colors, radii, shadows, easing, and durations are CSS variables in
`src/app/globals.css`, exposed to Tailwind through `@theme` (utilities like `bg-surface`,
`text-primary`, `rounded-lg`, `shadow-card`).

| Token              | Value     | Use                                            |
| ------------------ | --------- | ---------------------------------------------- |
| `--bg`             | `#ffffff` | Page background (`bg-background`)              |
| `--surface`        | `#faf9f7` | Off-white sections (`bg-surface`)              |
| `--surface-2`      | `#f2f1ee` | Cards, subtle fills (`bg-surface-2`)           |
| `--border`         | `#e6e4e0` | Borders (`border-border`)                      |
| `--text`           | `#0a0a0a` | Headings / primary text (`text-foreground`)    |
| `--text-secondary` | `#3f3f3f` | Body text (`text-secondary`)                   |
| `--text-muted`     | `#6b6b6b` | Muted text (`text-muted`)                      |
| `--primary`        | `#c2410c` | Orange accent, CTAs, links (`bg/text-primary`) |
| `--primary-hover`  | `#9a3412` | Hover state                                    |
| `--primary-soft`   | `#fff1e8` | Tinted backgrounds (`bg-primary-soft`)         |
| `--ink`            | `#101010` | Dark inversion blocks (`bg-ink`)               |

**Note on the accent color.** The design brief specified a neon `#ff5c00`. White text on that
orange only reaches 3.09:1 contrast, which fails WCAG AA (needs 4.5:1). The accent was deepened
to `#c2410c`, which clears AA (~5.2:1) for both white-on-orange and orange-on-white while
keeping the same warm, orange identity. It is a single token, so it is trivial to retune.

## Accessibility and performance

- Every route is statically generated (SSG). No per-request server work on the hot path,
  so it can sit behind a CDN and serve high concurrency. `public/assets/*` is sent with
  `Cache-Control: public, max-age=31536000, immutable` (see `next.config.ts`).
- Server Components by default; `"use client"` only on interactive leaves.
- Animations use transform/opacity only and are disabled under `prefers-reduced-motion`.
- Semantic HTML, one `h1` per page, ARIA on tabs / carousel / mobile menu, visible focus
  rings, skip-to-content link, WCAG AA contrast.
- `e2e/a11y.spec.ts` asserts **zero** axe violations (WCAG 2.0/2.1 A and AA) on every route.

## Testing

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The suite covers: every route renders with a single `h1`, the 404 page, axe accessibility
scans on all routes, the mobile menu, team tabs, publication filters, the news carousel, and the
stat count-up.

## Backend (API and database)

The marketing pages are static, but the app also serves a versioned JSON API from
`src/app/api/v1/**`. All handlers run on the Node.js runtime and are `force-dynamic` (never
prerendered). Server-only code lives under `src/server/` and is never imported by client
components.

### Layout

```
src/server/
  config/       # lazy, validated env (env.ts)
  db/           # Prisma client (pg driver adapter)
  http/         # route() wrapper, error envelope, pagination, rate limiter
  auth/         # password (argon2id), jwt (jose), refresh tokens, cookies, session guards
  users/ publications/ jobs/ applications/ announcements/   # service + dto per domain
  mail/         # mailto: draft builders (no transport)
  audit/ logging/
prisma/
  schema.prisma
  migrations/   # init + publications full-text-search
scripts/seed-admin.ts
src/proxy.ts    # security headers + CORS (Next 16 proxy convention)
```

### Local setup

1. Copy the environment template and fill it in:
   ```bash
   cp .env.example .env
   ```
   For local development point `DATABASE_URL` and `DIRECT_URL` at any Postgres 16+ instance.
   The `citext` and `pgcrypto` extensions are enabled by the first migration.
2. Apply migrations and generate the client:
   ```bash
   npm run db:deploy
   ```
3. Create the first admin (or pass the values as CLI args):
   ```bash
   npm run seed:admin -- admin@example.com 'Str0ng!passphrase' 'Lab Admin'
   ```
4. Run the app with `npm run dev`, or `npm run build && npm run start` for a production build.

### Auth model

- Login returns a short-lived **access JWT** (default 15 min) in the response body and sets an
  httpOnly, `SameSite=Strict` **refresh cookie** scoped to `/api/v1/auth`.
- Refresh tokens are opaque, stored only as SHA-256 hashes, and **rotate** on every use.
  Presenting a already-used token is treated as theft: the whole token family is revoked and
  the user's `tokenVersion` is bumped, invalidating outstanding access tokens.
- `requireAuth` / `requireAdmin` re-check the user live on every request (active flag +
  token version), so deactivation and password changes take effect immediately.
- Passwords are hashed with **argon2id**. New accounts get a temporary password and must
  change it on first sign-in.
- `/api/v1/auth/*` is rate-limited per IP; failed logins are written to the audit log.

### Endpoints

| Method(s)          | Path                                            | Access | Purpose                                                  |
| ------------------ | ----------------------------------------------- | ------ | -------------------------------------------------------- |
| GET                | `/api/v1/health`, `/api/v1/ready`               | public | Liveness / readiness (readiness pings the DB)            |
| POST               | `/api/v1/auth/login`                            | public | Sign in, set refresh cookie                              |
| POST               | `/api/v1/auth/refresh`                          | cookie | Rotate tokens                                            |
| POST               | `/api/v1/auth/logout`                           | cookie | Revoke the current refresh token                         |
| POST               | `/api/v1/auth/change-password`                  | user   | Change password, rotate all sessions                     |
| GET                | `/api/v1/me`                                    | user   | Current user profile                                     |
| GET, POST          | `/api/v1/admin/users`                           | admin  | List / create users                                      |
| PATCH              | `/api/v1/admin/users/[id]`                      | admin  | Update / deactivate a user                               |
| POST               | `/api/v1/admin/users/[id]/reset-password`       | admin  | Reset a password (returns a mail draft)                  |
| GET                | `/api/v1/publications`                          | public | List / full-text search                                  |
| POST               | `/api/v1/publications`                          | admin  | Create (dedup by DOI / BibTeX key)                       |
| GET, PATCH, DELETE | `/api/v1/publications/[id]`                     | mixed  | Read (public) / update / delete (admin)                  |
| POST               | `/api/v1/publications/parse`                    | admin  | Preview a BibTeX paste before saving                     |
| GET                | `/api/v1/jobs`                                  | public | Open positions                                           |
| POST               | `/api/v1/jobs`                                  | admin  | Create a position                                        |
| GET, PATCH, DELETE | `/api/v1/jobs/[id]`                             | mixed  | Read (public) / update / delete + cascade (admin)        |
| POST               | `/api/v1/jobs/[id]/apply`                       | public | Apply (JSON: phone + resume link required, rate-limited) |
| GET                | `/api/v1/admin/jobs`                            | admin  | All positions incl. closed                               |
| GET                | `/api/v1/admin/applications`                    | admin  | List applications (filter by job / status)               |
| GET                | `/api/v1/admin/applications/[id]`               | admin  | Application detail                                       |
| POST               | `/api/v1/admin/applications/[id]/approve/draft` | admin  | Build the welcome email (no commit)                      |
| POST               | `/api/v1/admin/applications/[id]/approve`       | admin  | Finalize: register the applicant (after email sent)      |
| POST               | `/api/v1/admin/applications/[id]/reject`        | admin  | Reject                                                   |
| GET                | `/api/v1/announcements`                         | public | Published announcements                                  |
| GET, POST          | `/api/v1/admin/announcements`                   | admin  | List all (incl. drafts) / create                         |
| PATCH, DELETE      | `/api/v1/admin/announcements/[id]`              | admin  | Update (publish/unpublish) / delete                      |

Every response uses a consistent envelope: success payloads are returned directly; errors are
`{ "error": { "code", "message", "details? } }` with the right HTTP status. Validation failures
(Zod) return `422`.

### Email as `mailto:` drafts

There is no SMTP or email provider. Admin actions that would notify a person (approve, password
reset, account creation) instead return a `{ to, subject, body }` draft. The admin UI turns that
into a `mailto:` link so the message is sent from the admin's own inbox. This keeps the system
free of email-service cost and credentials.

### Reviewing applications

Admins open a position from the Join page to reach its review page (`/admin/jobs/[id]`), a
sortable, filterable table of applicants. Approval is a two-step, send-first flow: the admin
generates the welcome email (with fresh credentials) via `.../approve/draft`, sends it from
their own inbox, then finalizes with `.../approve`; the account only goes live once the email
is on its way. Reject simply marks the application rejected. Resumes are the links applicants
shared, so there is nothing to store.

## Deployment

The marketing pages are statically generated; the API routes need a Node.js runtime and a
Postgres database, so deploy to a Node host (not a static-only CDN target). Set the environment
variables from `.env.example`, run `npm run db:deploy` on release, keep the immutable cache
headers for `public/assets`, and serve `npm run build` output with `npm run start`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`: it spins up a
Postgres service, applies migrations, then runs Prettier check, ESLint, `tsc`, and the
production build.
