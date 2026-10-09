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
`frontend/.env.example` as its environment template. The backend foundation is
still pending and will document its API port and environment values when it is
established.

Run repository checks:

```bash
npm run build
npm run typecheck
npm run lint
npm run format:check
```
