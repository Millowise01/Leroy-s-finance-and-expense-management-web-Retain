# Retain — Personal Expense & Budget Manager

Retain is a full-stack web application for recording personal expenses, tracking
monthly budgets, and gaining clear spending insights. It is built with React 19,
TypeScript, and Vite on the frontend and Node.js, Express 5, and TypeScript on
the backend, backed by a PostgreSQL database managed through Prisma 7.

## Live application

> **Deployed URL:** https://retain-frontend.onrender.com
>
> **API base URL:** https://retain-backend-xglb.onrender.com/api
> **Health check:** https://retain-backend-xglb.onrender.com/api/health

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
- [Admin account](#admin-account)
- [Demo credentials](#demo-credentials)
- [Testing with Postman](#testing-with-postman)
- [Inspecting the database with pgAdmin](#inspecting-the-database-with-pgadmin)

---

## Features

### User features

- **Sign up / Sign in / Sign out** — JWT stored in an `httpOnly` cookie; session
  restored automatically on page load via `GET /api/auth/me`.
- **Expense management** — Create, view, update, and delete personal expenses.
  Each expense records a title, optional description, amount, category, date,
  payment method, and optional notes.
- **Expense details view** — Click the eye icon on any expense row to inspect
  all fields in a detail dialog without leaving the page.
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
- **Admin user creation** — Administrators can create new user accounts with any
  role via `POST /api/admin/users`. The public signup endpoint always creates
  `USER` role accounts only.
- **Platform insights** — Total registered users, total expenses recorded, total
  expense value, expenses recorded this month (by transaction date), spending per
  category, top 5 most-used categories, bottom 5 least-used categories, 10 most
  recently added expenses, and 10 most recently registered users.

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
| Database | PostgreSQL 14+ |
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

```powershell
# 1. Clone the repository
git clone <repository-url>
cd retain

# 2. Install all dependencies (frontend + backend) from the root
npm install

# 3. Create the backend environment file
Copy-Item backend/.env.example backend/.env

# 4. Edit backend/.env — set DATABASE_URL and JWT_SECRET (see Environment variables)

# 5. Set up the database (see Database setup)
```

---

## Environment variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (see format below) |
| `JWT_SECRET` | ✅ | Random string used to sign JWTs — minimum 32 characters |
| `NODE_ENV` | — | `development` or `production` (defaults to `development`) |
| `PORT` | — | Port the API listens on (default `4000`) |
| `FRONTEND_URL` | — | CORS origin for the frontend (default `http://localhost:5173`) |
| `SEED_DEMO_DATA` | — | Set to `true` only when running the demo seeder |

**DATABASE_URL format:**

```
postgresql://<username>:<password>@<host>:<port>/<database>
```

Example for a local PostgreSQL installation where the superuser is `postgres`
and the database is named `retain`:

```
DATABASE_URL=postgresql://postgres:YourPassword@localhost:5432/retain
```

> The password is the one you set when you installed PostgreSQL. If you need to
> reset it, open pgAdmin → right-click the `postgres` login role → Properties →
> Definition tab → set a new password → Save. Then update `DATABASE_URL` to
> match.

**Generating a secure JWT secret (run once, paste the output into `.env`):**

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

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
already-reviewed migration history to a production database.

### Seeding demo data (optional)

The seeder creates 1 admin, 15 demo users, 12 categories, and sample expenses.
It uses deterministic upserts and never deletes existing records.

Set `SEED_DEMO_DATA=true` in `backend/.env`, run the seed, then revert:

```powershell
# In backend/.env temporarily set: SEED_DEMO_DATA=true
npm run db:seed --workspace backend
# Then revert: SEED_DEMO_DATA=false
```

---

## Running the application

Open two separate PowerShell terminals:

**Terminal 1 — backend:**

```powershell
npm run dev:backend
```

The API starts at `http://localhost:4000`.
Health check: `GET http://localhost:4000/api/health`

**Terminal 2 — frontend:**

```powershell
npm run dev:frontend
```

The app opens at `http://localhost:5173`.

---

## Repository checks

```powershell
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

**Signup validation:**
- `name` — 2–100 characters
- `email` — valid email, must be unique
- `password` — 8–100 characters
- `role` field in the request body is **ignored** — public signup always creates `USER`

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
| `endDate` | ISO date | Expenses on or before this date (inclusive of the full day) |
| `minAmount` | number | Minimum expense amount |
| `maxAmount` | number | Maximum expense amount |
| `sortBy` | `date` \| `amount` | Sort field (default `date`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default `desc`) |
| `page` | number | Page number, 1-based (default `1`) |
| `limit` | number | Results per page, max 100 (default `10`) |

Invalid parameters return HTTP 400 with a descriptive message.

**Expense body fields:**

```json
{
  "title": "string (2–100 chars, cannot be only whitespace)",
  "description": "string (optional, max 500)",
  "amount": "string decimal > 0, e.g. \"12.50\"",
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

Budget response includes: `budget`, `spent`, `remaining`, `percentage`, `status`
(`WITHIN` / `APPROACHING` / `OVER`).

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
| `GET` | `/` | ✅ | Returns spending summary, budget status, category breakdown, and recent expenses. Query params: `month`, `year`. |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/insights` | ✅ Admin | Platform-wide statistics. |
| `POST` | `/users` | ✅ Admin | Create a user with any role. Body: `{ name, email, password, role? }` |

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

Route protection:

- `ProtectedRoute` — redirects unauthenticated users to `/signin`.
- `AdminRoute` — redirects non-admin users to `/dashboard`.

On the backend, `requireAuth` validates the JWT from the `retain_token` cookie
and attaches `req.user`. `requireAdmin` checks `req.user.role === 'ADMIN'` and
returns `403` otherwise.

---

## State management

All expense **filtering, searching, sorting, and pagination** state is managed
with **Redux Toolkit** via `expenseFilterSlice` at `state.expenseFilters`.

Actions: `setSearch` · `setCategoryId` · `setPaymentMethod` · `setStartDate` ·
`setEndDate` · `setMinAmount` · `setMaxAmount` · `setSortBy` · `setSortOrder` ·
`setPage` · `resetFilters`

Changing any filter resets the page to `1`.

---

## Admin account

The public signup form always creates a `USER` account. Admin accounts are
created through the seed script or via `POST /api/admin/users` by an existing
admin.

**To create the admin account locally (seed method):**

1. Ensure `backend/.env` has the correct `DATABASE_URL`.
2. Temporarily set `SEED_DEMO_DATA=true` in `backend/.env`.
3. Run: `npm run db:seed --workspace backend`
4. Revert `SEED_DEMO_DATA=false`.

The seed creates `admin@retain.local` / `Admin@12345`.

**To create an admin via the API (requires an existing admin session):**

```
POST http://localhost:4000/api/admin/users
Content-Type: application/json

{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "SecurePass1",
  "role": "ADMIN"
}
```

---

## Demo credentials

For **local development only**.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@retain.local` | `Admin@12345` |
| User | `demo.user01@retain.local` | `User@12345` |

Demo users are numbered `demo.user01` through `demo.user15`.

---

## Testing with Postman

The API uses `httpOnly` cookies. Postman handles these automatically.

Use the production base URL `https://retain-backend-xglb.onrender.com` or
`http://localhost:4000` for local development.

### Step 1 — confirm the backend is running

```
GET https://retain-backend-xglb.onrender.com/api/health
```

Expected: `{ "status": "ok", "application": "Retain" }`

### Step 2 — sign in

```
POST https://retain-backend-xglb.onrender.com/api/auth/signin
Content-Type: application/json

{ "email": "admin@retain.local", "password": "Admin@12345" }
```

Postman stores the `retain_token` cookie automatically.

### Step 3 — verify authentication

```
GET https://retain-backend-xglb.onrender.com/api/auth/me
```

### Step 4 — test endpoints

```
GET  https://retain-backend-xglb.onrender.com/api/expenses
GET  https://retain-backend-xglb.onrender.com/api/expenses?search=food&sortBy=amount&sortOrder=desc&page=1
GET  https://retain-backend-xglb.onrender.com/api/dashboard?month=10&year=2026
GET  https://retain-backend-xglb.onrender.com/api/budgets/2026/10
GET  https://retain-backend-xglb.onrender.com/api/admin/insights
```

### Step 5 — sign out

```
POST https://retain-backend-xglb.onrender.com/api/auth/signout
```

### Step 6 — register a new regular user

```
POST https://retain-backend-xglb.onrender.com/api/auth/signup
Content-Type: application/json

{ "name": "Jane Smith", "email": "jane@example.com", "password": "SecurePass1" }
```

Expected: HTTP 201 with the new user object and a `retain_token` cookie.

---

## Inspecting the database with pgAdmin

1. Open **pgAdmin 4**.
2. Right-click **Servers → Register → Server**.
3. **General** tab — Name: `Local Retain`.
4. **Connection** tab:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: _(your PostgreSQL installation password)_
5. Click **Save**.
6. Expand **Servers → Local Retain → Databases → retain → Schemas → public → Tables**.

Tables: `Budget`, `Category`, `Expense`, `User`, `_prisma_migrations`.

To view users (passwords are bcrypt hashes — never plain text):

```sql
SELECT id, name, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC;
```
