# Retain

Retain is a personal finance and expense management web application.

## Repository layout

- `frontend/` contains the React, TypeScript, and Vite web application.
- `backend/` contains the Node.js, Express, and TypeScript API.

The repository uses npm workspaces so shared development commands can be run from
the root while frontend and backend dependencies remain isolated in their own
packages.

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer

## Development commands

Install dependencies from the repository root:

```bash
npm install
```

Run the frontend or backend independently:

```bash
npm run dev:frontend
npm run dev:backend
```

The frontend foundation is available at `http://localhost:5173` and uses
`frontend/.env.example` as its environment template. The backend runs at
`http://localhost:4000` and uses `backend/.env.example` as its environment
template. Its health endpoint is `GET /api/health`.

Run repository checks:

```bash
npm run build
npm run typecheck
npm run lint
npm run format:check
```

## Backend database setup

The backend uses Prisma 7 with PostgreSQL and the `@prisma/adapter-pg` driver.
Create a local environment file from the placeholder template, then edit
`backend/.env` with your own PostgreSQL connection string and JWT secret:

```powershell
Copy-Item backend/.env.example backend/.env
```

The Prisma schema is at `backend/prisma/schema.prisma`. These commands do not
run automatically during installation:

```powershell
npm run db:validate --workspace backend
npm run db:generate --workspace backend
npm run db:migrate --workspace backend -- --name init
```

Use `db:migrate` for local development and `db:deploy` for an already-reviewed
production migration history. Do not run either command until `DATABASE_URL`
points to the intended database.

Demo data is disabled by default. It uses deterministic upserts and never
deletes existing records, but it must still be run only against a local
development database:

```powershell
$env:SEED_DEMO_DATA = 'true'
npm run db:seed --workspace backend
```

The local demo administrator is `admin@retain.local` with password
`Admin@12345`; demo users use `User@12345`. These credentials are for local
development only and must not be used in production.
