# Retain — Personal Expense & Budget Manager

Retain is a full-stack web application for recording personal expenses, tracking
monthly budgets, and gaining clear spending insights. It is built with React,
TypeScript, and Vite on the frontend and Node.js, Express, and TypeScript on the
backend, backed by a PostgreSQL database managed through Prisma.

## Live application

> **Deployed URL:** _Add your deployment URL here once the application is live._

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Running the application](#running-the-application)
- [Repository checks](#repository-checks)
- [API reference](#api-reference)
- [Authentication](#authentication)
- [State management](#state-management)
- [Demo credentials](#demo-credentials)

---

## Features

### User features

- **Sign up / Sign in / Sign out** — JWT stored in an `httpOnly` cookie; session
  restored automatically on page load via `GET /api/auth/me`.
- **Expense management** — Create, view, update, and delete personal expenses.
  Each expense records a title, optional description, amount, category, date,
  payment method, and optional notes.
- **Filtering & search** — Filter expenses by keyword, category, payment method,
  date range, and amount range. Sort by date or amount in either direction.
  Results are paginated (10 per page by default, up to 100).
- **Monthly budget** — Set or update a spending limit for the current month.
  The budget page shows total spent, remaining balance, and a progress bar with
  status: **WITHIN** (< 70 %), **APPROACHING** (70–99 %), or **OVER** (≥ 100 %).
- **User dashboard** — Displays total spending for the current month, monthly
  budget, remaining budget, highest individual expense, spending breakdown by
  category, and the five most recent expenses.

### Admin features (role-protected)

- **Category management** — Create, update, and delete expense categories.
  Deletion is blocked when expenses are still assigned to the category.
- **Platform insights** — Total registered users, total expenses recorded, total
  expense value, expenses recorded this month, spending per category, top 5
  most-used categories, bottom 5 least-used categories, 10 most recently added
  expenses, and 10 most recently registered users.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Material UI 9 |
| State — auth | React Context API |
| State — filters | Redux Toolkit |
| HTTP client | Axios |
| Backend | Node.js, Express 5, TypeScript |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` + `httpOnly` cookie |
| Validation | Zod |

---

## Repository layout

```
retain/
├── frontend/          React + TypeScript + Vite application
│   └── src/
│       ├── components/    Shared UI components (layout, forms, stat cards)
│       ├── context/       AuthContext — authentication state and actions
│       ├── features/      Redux slices (expenseFilterSlice)
│       ├── pages/         Route-level page components
│       ├── routes/        ProtectedRoute and AdminRoute guards
│       ├── services/      Axios API wrappers per resource
│       ├── store/         Redux store configuration
│       ├── types/         TypeScript type definitions
│       └── utils/         Formatters and error helpers
└── backend/           Node.js + Express + TypeScript API
    ├── prisma/
    │   ├── schema.prisma  Database schema
    │   └── seed.ts        Demo data seeder
    └── src/
        ├── config/        Environment config and Prisma client
        ├── controllers/   Request handlers per resource
        ├── middleware/     Auth, admin, and error middleware
        ├── routes/        Express routers per resource
        ├── services/      Business logic and database queries
        └── utils/         JWT and password helpers
```

The repository uses **npm workspaces** so all commands can be run from the root.

---

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- PostgreSQL 14 or newer (a running local instance is sufficient for development)

---

## Getting started

```bash
# 1. Clone the repository
git clone <repository-url>
cd retain

# 2. Install all dependencies (frontend + backend) from the root
npm install

# 3. Create the backend environment file
Copy-Item backend/.env.example backend/.env   # PowerShell
# or
cp backend/.env.example backend/.env          # bash / macOS / Linux

# 4. Edit backend/.env — set DATABASE_URL and JWT_SECRET (see Environment variables)

# 5. Set up the database (see Database setup)
```

---

## Environment variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/retain` |
| `JWT_SECRET` | ✅ | Long random string used to sign JWTs |
| `NODE_ENV` | — | `development` or `production` (defaults to `development`) |
| `PORT` | — | Port the API listens on (default `4000`) |
| `FRONTEND_URL` | — | CORS origin for the frontend (default `http://localhost:5173`) |
| `SEED_DEMO_DATA` | — | Set to `true` only when running the demo seeder |

### `frontend/.env` (optional)

Copy `frontend/.env.example` to `frontend/.env` if you need to override the API
base URL:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:4000/api`) |

---

## Database setup

```powershell
# Validate the Prisma schema
npm run db:validate --workspace backend

# Generate the Prisma client
npm run db:generate --workspace backend

# Run migrations (creates the database schema)
npm run db:migrate --workspace backend -- --name init
```

Use `db:migrate` for local development. Use `db:deploy` when applying an
already-reviewed migration history to a production database. Do not run either
command until `DATABASE_URL` points to the intended database.

### Seeding demo data (optional)

The seeder creates 1 admin, 15 demo users, 12 categories, and sample expenses.
It uses deterministic upserts and never deletes existing records. Run it only
against a local development database.

```powershell
# Temporarily enable seeding, then run
$env:SEED_DEMO_DATA = 'true'
npm run db:seed --workspace backend
```

Alternatively, set `SEED_DEMO_DATA=true` in `backend/.env`, run the seed, then
revert the value.

---

## Running the application

```bash
# Start both frontend and backend concurrently (if a root dev script is configured)
# or start them in separate terminals:

npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health`

---

## Repository checks

```bash
npm run build        # Type-check and build both packages
npm run typecheck    # TypeScript type-check only
npm run lint         # ESLint across both packages
npm run format:check # Prettier format check
```

---

## API reference

All endpoints are prefixed with `/api`. Authenticated endpoints require a valid
`retain_token` cookie (set automatically on sign-in / sign-up).

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register a new user. Body: `{ name, email, password }` |
| `POST` | `/signin` | — | Sign in. Body: `{ email, password }`. Sets `retain_token` cookie. |
| `POST` | `/signout` | — | Clears the auth cookie. |
| `GET` | `/me` | ✅ | Returns the currently authenticated user. |

### Expenses — `/api/expenses`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List expenses with filtering, sorting, and pagination. |
| `GET` | `/:id` | ✅ | Get a single expense by ID (must belong to the user). |
| `POST` | `/` | ✅ | Create an expense. |
| `PUT` | `/:id` | ✅ | Update an expense (must belong to the user). |
| `DELETE` | `/:id` | ✅ | Delete an expense (must belong to the user). |

**`GET /api/expenses` query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Full-text search on title and description |
| `categoryId` | string | Filter by category ID |
| `paymentMethod` | string | `CASH` \| `MOBILE_MONEY` \| `DEBIT_CARD` \| `CREDIT_CARD` \| `BANK_TRANSFER` \| `OTHER` |
| `startDate` | ISO date | Expenses on or after this date |
| `endDate` | ISO date | Expenses on or before this date |
| `minAmount` | number | Minimum expense amount |
| `maxAmount` | number | Maximum expense amount |
| `sortBy` | `date` \| `amount` | Sort field (default `date`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default `desc`) |
| `page` | number | Page number (default `1`) |
| `limit` | number | Results per page, max 100 (default `10`) |

**Expense body fields:**

```json
{
  "title": "string (2–100 chars)",
  "description": "string (optional, max 500)",
  "amount": "string decimal, e.g. \"12.50\"",
  "categoryId": "string",
  "paymentMethod": "CASH | MOBILE_MONEY | DEBIT_CARD | CREDIT_CARD | BANK_TRANSFER | OTHER",
  "expenseDate": "ISO 8601 date string",
  "notes": "string (optional, max 500)"
}
```

### Budgets — `/api/budgets`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/:year/:month` | ✅ | Get the budget and spending summary for a given month. |
| `POST` | `/` | ✅ | Create or update the budget for a month. Body: `{ amount, month, year }` |

### Categories — `/api/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all categories. |
| `POST` | `/` | ✅ Admin | Create a category. Body: `{ name, description? }` |
| `PUT` | `/:id` | ✅ Admin | Update a category. |
| `DELETE` | `/:id` | ✅ Admin | Delete a category (blocked if expenses use it). |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Returns spending summary, budget status, category breakdown, and recent expenses for the given month. Query params: `month`, `year`. |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/insights` | ✅ Admin | Platform-wide statistics: user count, expense totals, category rankings, recent activity. |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: "ok", application: "Retain" }` |

---

## Authentication

Authentication is implemented with **React Context** (`AuthContext` /
`AuthProvider`) on the frontend. The context exposes `user`, `loading`,
`isAuthenticated`, `signin`, `signup`, and `signout`. On mount it calls
`GET /api/auth/me` to restore the session from the existing cookie.

Route protection is handled by two components:

- `ProtectedRoute` — redirects unauthenticated users to `/signin`.
- `AdminRoute` — redirects non-admin users to `/dashboard`.

On the backend, the `requireAuth` middleware validates the JWT from the
`retain_token` cookie and attaches `req.user`. The `requireAdmin` middleware
checks `req.user.role === 'ADMIN'` and returns `403` otherwise.

---

## State management

All expense **filtering, searching, sorting, and pagination** state is managed
with **Redux Toolkit** via `expenseFilterSlice`. The slice is mounted at
`state.expenseFilters` in the Redux store and exposes actions:

`setSearch` · `setCategoryId` · `setPaymentMethod` · `setStartDate` ·
`setEndDate` · `setMinAmount` · `setMaxAmount` · `setSortBy` · `setSortOrder` ·
`setPage` · `resetFilters`

Resetting any filter also resets the page to `1` to avoid empty result pages.

---

## Demo credentials

These credentials are for **local development only** and must not be used in
production.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@retain.local` | `Admin@12345` |
| User | `demo.user01@retain.local` | `User@12345` |

Demo users are numbered `demo.user01` through `demo.user15`.
