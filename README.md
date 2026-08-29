# WFH Attendance System

Employee WFH attendance tracker + HRD admin console, sharing one backend
split into two microservices.

- **Backend:** NestJS (TypeScript) — `api-gateway` (REST + WebSocket),
  `audit-service` (RabbitMQ consumer)
- **Frontend:** React + Vite + TypeScript — `employee-web`, `admin-web`
- **Database:** PostgreSQL, two independent instances
- **Queue:** RabbitMQ

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

Every profile change (phone, photo, password) emits `profile.updated` onto
RabbitMQ for `audit-service` to persist, and broadcasts a `profile-changed`
WebSocket event that `admin-web` shows as a live toast.

## Setup

Requires Node 22+ and Docker.

```bash
git clone <this-repo>
cd wfh-attendance
npm install

cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/audit-service/.env.example apps/audit-service/.env
cp apps/employee-web/.env.example apps/employee-web/.env
cp apps/admin-web/.env.example apps/admin-web/.env

docker compose up -d
```

Run Prisma from inside each app's directory, not the repo root:

```bash
cd apps/api-gateway && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && cd ../..
cd apps/audit-service && npx prisma generate && npx prisma migrate deploy && cd ../..
```

Start everything (separate terminals):

```bash
npm run start:dev -w apps/api-gateway     # http://localhost:3000
npm run start:dev -w apps/audit-service
npm run dev -w apps/employee-web          # http://localhost:5173
npm run dev -w apps/admin-web -- --port 5174   # http://localhost:5174
```

## Seed credentials

Password for every account: **`password123`**

| Email | Role |
|---|---|
| `administrator@dexa.co.id` | ADMIN |
| `daffa@dexa.co.id` | EMPLOYEE |
| `maevy@dexa.co.id` | EMPLOYEE |
| `eko@dexa.co.id` | EMPLOYEE |

Any employee account logs into `employee-web`. `admin-web` only accepts the
admin account, enforced both client-side and on every `/admin/*` API call.

## API reference

`api-gateway` (`http://localhost:3000`). Everything but `/auth/login`
requires `Authorization: Bearer <token>`.

| Method | Path | Who |
|---|---|---|
| POST | `/auth/login` | anyone |
| GET | `/auth/me` | any user |
| GET | `/profile` | employee |
| PATCH | `/profile/phone` \| `/password` \| `/photo` | employee |
| POST | `/attendance` | employee |
| GET | `/attendance/summary?from=&to=` | employee |
| GET / POST `/admin/employees`, PATCH `/admin/employees/:id` | admin |
| GET | `/admin/attendance` | admin (read-only, no write endpoint exists) |

## Key decisions

- **Two Postgres instances, not two schemas.** Audit DB has to be genuinely
  independent — no shared connection, no cross-database FK.
- **RabbitMQ manual ack**, not auto-ack — a crash mid-write would otherwise
  lose the message silently. Trade-off: at-least-once delivery, so a crash
  right after the write can duplicate an audit row (harmless for a log).
- **JWT holds only `{ sub, role }`** — anything else could go stale; fresh
  data is looked up by `sub` when needed.
- **JWT in `localStorage`**, not an httpOnly cookie — no server-rendered
  page or session middleware to set one from. Trade-off: readable by JS on
  the page, so an XSS bug would leak it.
- **No FK from the audit log to `Employee`** — not a preference, a foreign
  key across two separate databases isn't possible.
- **No delete/write endpoints for admin employees or attendance** — matches
  the brief's scope (add/update only, attendance read-only); not building
  the route is a stronger guarantee than hiding one behind a guard.
- **Shared `packages/api-client`** between both frontends for fetch + auth,
  no build step needed since Vite transpiles the linked TS source directly.

## Known limitations

- WebSocket handshake has no auth — anyone who knows the URL can connect
  and receive profile-change events (id + field only, no values).
- Photos stored on local disk, not object storage.
- No pagination, no password reset, no employee delete — out of scope.
- No automated test suite for the frontends; api-gateway has a small e2e
  suite covering auth, RBAC, and one CRUD round-trip.
- No deployment — submission is this repository.

## Project structure

```
apps/
  api-gateway/     NestJS REST API + WebSocket gateway
  audit-service/   NestJS microservice, RabbitMQ consumer
  employee-web/    React + Vite — login, profile, absen, summary
  admin-web/       React + Vite — employees, attendance, live toast
packages/
  api-client/      Shared fetch wrapper + types
```
