# WFH Attendance System

A technical take-home for a Dexa Group Fullstack Developer application: an
employee WFH attendance tracker and an HRD admin monitoring console, sharing
one backend split into two microservices.

- **Backend:** NestJS (TypeScript), two services — `api-gateway` (REST +
  WebSocket) and `audit-service` (RabbitMQ consumer)
- **Frontend:** React + Vite + TypeScript, two apps — `employee-web` and
  `admin-web`
- **Database:** PostgreSQL — two independent instances, one per service
- **Message queue:** RabbitMQ

## Architecture

```
┌──────────────────┐     ┌──────────────────┐
│  employee-web    │     │   admin-web      │
│  (React + Vite)  │     │  (React + Vite)  │
└────────┬─────────┘     └────────┬─────────┘
         │  REST + JWT            │  REST + JWT + WebSocket
         └───────────┬────────────┘
                      ▼
         ┌───────────────────────┐
         │      api-gateway      │  NestJS HTTP
         │  auth / profile /     │
         │  attendance / admin   │
         └───┬───────────────┬───┘
             │               │ emit profile.updated
             ▼               ▼
      ┌─────────────┐   ┌──────────┐
      │ postgres    │   │ RabbitMQ │
      │ (main)      │   └────┬─────┘
      └─────────────┘        │
                              ▼
                   ┌──────────────────┐
                   │  audit-service   │  NestJS microservice
                   └────────┬─────────┘
                             ▼
                   ┌──────────────────┐
                   │ postgres (audit) │  separate database
                   └──────────────────┘
```

`api-gateway` is the only service either frontend talks to over HTTP. Every
profile change (phone, photo, password) does two things at once: emits
`profile.updated` onto a durable RabbitMQ queue, which `audit-service`
consumes and persists to its own database, and broadcasts a `profile-changed`
event over a WebSocket that `admin-web` listens to for a live toast.

## Prerequisites

- Node.js 22+
- Docker (for Postgres ×2 and RabbitMQ)

## Setup

```bash
git clone <this-repo>
cd wfh-attendance
npm install
```

Copy every `.env.example` to `.env` (defaults below already match each
other and `docker-compose.yml` — no edits needed to run locally):

```bash
cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/audit-service/.env.example apps/audit-service/.env
cp apps/employee-web/.env.example apps/employee-web/.env
cp apps/admin-web/.env.example apps/admin-web/.env
```

Bring up the databases and RabbitMQ:

```bash
docker compose up -d
docker compose ps   # expect 3 containers: postgres-main, postgres-audit, rabbitmq
```

Run migrations and seed data. Run Prisma from **inside each app's
directory**, not the repo root — `npx prisma` at the root resolves
whatever version npm's registry serves as `latest` (currently an
`8.0.0-rc` with a different CLI), not the `7.10.0` actually pinned in
each workspace's `package.json`. Running it from inside the workspace
directory makes `npx` find the locally-installed pinned binary first:

```bash
cd apps/api-gateway
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ../..

cd apps/audit-service
npx prisma generate
npx prisma migrate deploy
cd ../..
```

Start everything (four terminals, or four background processes):

```bash
npm run start:dev -w apps/api-gateway     # http://localhost:3000
npm run start:dev -w apps/audit-service   # RabbitMQ consumer, no HTTP port
npm run dev -w apps/employee-web          # http://localhost:5173
npm run dev -w apps/admin-web -- --port 5174   # http://localhost:5174
```

RabbitMQ's management UI is at `http://localhost:15672` (guest/guest) if you
want to watch the queue directly.

## Seed credentials

All seeded accounts use the same password: **`password123`**

| Email | Role |
|---|---|
| `administrator@dexa.co.id` | ADMIN |
| `daffa@dexa.co.id` | EMPLOYEE |
| `maevy@dexa.co.id` | EMPLOYEE |
| `eko@dexa.co.id` | EMPLOYEE |

Log into `employee-web` with any employee account, `admin-web` only accepts
the admin account (role-checked on login, enforced again on every `/admin/*`
API call regardless of what the frontend does).

## API reference

All routes below live on `api-gateway` (`http://localhost:3000`). Everything
except `/auth/login` requires `Authorization: Bearer <token>`.

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/auth/login` | anyone | returns a JWT |
| GET | `/auth/me` | any logged-in user | returns `{ sub, role }` from the token |
| GET | `/profile` | employee | own profile |
| PATCH | `/profile/phone` | employee | |
| PATCH | `/profile/password` | employee | requires `currentPassword` |
| PATCH | `/profile/photo` | employee | `multipart/form-data`, field `file` |
| POST | `/attendance` | employee | `{ status: "MASUK" \| "PULANG" }` |
| GET | `/attendance/summary?from=&to=` | employee | defaults to start-of-month → today (WIB) |
| GET | `/admin/employees` | admin | |
| POST | `/admin/employees` | admin | sets an initial password |
| PATCH | `/admin/employees/:id` | admin | name/email/position/phone — not password |
| GET | `/admin/attendance` | admin | every employee, read-only, no write endpoint exists |

## Decisions

Full reasoning log with every alternative considered lives in the private
planning folder used while building this; the headline decisions:

**Two separate Postgres instances, not two schemas in one.** The audit DB
has to be genuinely independent — no shared connection, no possibility of a
cross-database foreign key, no single outage domain covering both. Cost:
more containers, two connection strings, no cross-database joins (nothing
in the brief needs one).

**RabbitMQ with manual ack (`noAck: false`), not the default auto-ack.**
Auto-ack marks a message delivered the instant it's handed to the consumer,
before the handler runs — a crash mid-write would lose it silently. Manual
ack only confirms after the DB write succeeds, with `nack(..., requeue:
true)` on failure. This is at-least-once delivery: a crash *after* the
write but *before* the ack can produce a duplicate audit row. Accepted,
since it's an audit log — a harmless duplicate beats silent loss, and the
brief doesn't ask for deduplication.

**JWT holds only `{ sub, role }`, nothing else.** Anything else embedded
(name, phone) can go stale the moment that field changes elsewhere.
Endpoints that need profile data look it up fresh from the DB by `sub`.

**JWT stored in `localStorage`, not an httpOnly cookie.** This is a pure
SPA on a separate origin from the API, with no server-rendered page to set
a cookie from and no session middleware on the backend. `localStorage` is a
few lines; cookie-based auth would mean CORS-with-credentials, CSRF
tokens, and cookie-parsing middleware for a fixed-scope take-home. Trade-off:
the token is readable by any JS on the page, so an XSS bug would leak it —
accepted given the app's size and the absence of any third-party scripts.

**No FK from `ProfileChangeLog.employeeId` to `Employee`.** Not a
preference — a foreign key across two separate Postgres instances isn't
something Postgres can express. Accepted: no referential integrity on
`employee_id` in the audit DB, but the brief doesn't require employee
delete, and audit logs are meant to outlive the record they describe.

**No `DELETE /admin/employees/:id`, and no write endpoint for attendance at
all.** PRD scope is "penambahan ataupun update" (add/update) for employees,
and attendance monitoring is explicitly read-only. Not building the write
route at all is a stronger guarantee than building it and hiding it behind
a guard — there's no route to accidentally expose.

**Shared `packages/api-client` between both frontends.** Both apps need
JWT-attached fetch, typed errors, and login. npm workspaces resolve it for
free with no build step — Vite transpiles the linked TypeScript source
directly.

## Known limitations

Stated plainly, not discovered by a reader:

- **WebSocket handshake has no auth.** `admin-web` is the only client that
  connects to the notification gateway in practice, but the socket itself
  doesn't verify a JWT or check role — anyone who knows the URL could
  connect and receive `profile-changed` events (which only carry an
  employee id and which field changed, no values).
- **Photos are stored on local disk** (`apps/api-gateway/uploads/`), not
  object storage — fine for a take-home with no deployment target, would
  not survive a redeploy or scale past one instance.
- **No pagination anywhere** — the admin attendance table and employee
  list return everything in one response. Fine at seed-data scale,
  explicitly out of scope per the brief.
- **No password reset flow, no employee delete** — both explicitly out of
  scope per the brief.
- **No automated test suite.** Every endpoint and UI flow was verified by
  hand (curl for the API contract, browser QA at 375px for both frontends,
  a throwaway `socket.io-client` script to confirm the WebSocket payload).
  Not requested by the brief; would add if time allowed.
- **No deployment** — submission is this repository; `docker compose up`
  plus the four `npm run dev`/`start:dev` commands above is the whole
  runtime.

## Project structure

```
apps/
  api-gateway/     NestJS REST API — auth, profile, attendance, admin, WebSocket gateway
  audit-service/   NestJS microservice — RabbitMQ consumer, writes to the audit DB
  employee-web/    React + Vite — login, profile, absen, summary
  admin-web/       React + Vite — login, employee management, attendance monitor, live toast
packages/
  api-client/      Shared fetch wrapper + types, used by both frontends
docker-compose.yml postgres ×2 + RabbitMQ
```
