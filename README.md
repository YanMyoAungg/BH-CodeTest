# Frontend Code Test Project

A full-stack employee management dashboard built as a frontend code test assignment. React + Vite on the client, Apollo Server (GraphQL) on the backend, with a SQLite database and JWT-based authentication.

| Decision                                                            | Why                                                                                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **localStorage** for JWT                                            | Simple, no CSRF worries, no cookie config. A production app would use HTTP-only cookies with a BFF — overkill for a code test. |
| **Feature-based folders** (`features/employees/`, `features/auth/`) | Everything about a feature lives together — easier to find, easier to review, scales better than file-type folders.            |
| **SQLite**                                                          | Zero-install database, single file. Easy to setup.                                                                             |
| **GraphQL**                                                         | I chose the GraphQL over REST for this code test beause on this opportunity I wanted to learn GraphQL as well.                 |
| **Vite** over Next.js                                               | No SSR/SSG complexity for a dashboard CRUD app. Fast HMR, simpler setup.                                                       |

## Quick Start (Docker)

The easiest way to run the project — no Node.js or pnpm needed.

```bash
1. Start both server and client
docker compose up --build

2. Open the app
http://localhost:3001
```

The database is automatically created and seeded with **150 sample employees** on first run. Data is persisted in a Docker volume so it survives restarts.

### Environment variables (optional)

Docker uses sensible defaults out of the box. If you want to customize:

```bash
cp .env.docker .env
# Edit .env and change JWT_SECRET, then run:
docker compose up --build
```

| Variable          | Default                               | Description                         |
| ----------------- | ------------------------------------- | ----------------------------------- |
| `JWT_SECRET`      | `change-me-to-a-secure-random-string` | Secret key for signing JWTs         |
| `VITE_API_URL`    | `http://localhost:3000/graphql`       | GraphQL endpoint the client calls   |
| `VITE_TOKEN_NAME` | `better_hr_token`                     | localStorage key for the auth token |

### Stop and clean up

```bash
docker compose down        # Stop containers, keep data
docker compose down -v     # Stop containers and delete the database
```

---

## Quick Start (Local Development)

If you prefer running without Docker.

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Seed the database (creates admin user + 150 employees)
pnpm db:seed

# 4. Start both server and client
pnpm dev
```

- **Server**: http://localhost:3000/graphql (Apollo Sandbox available)
- **Client**: http://localhost:3001

### Login Credentials

| Field    | Value         |
| -------- | ------------- |
| Username | `admin`       |
| Password | `password123` |

---

## Project Structure

```
better-hr/
├── docker-compose.yml
├── Dockerfile
├── .env.docker                 # Docker environment variables (optional)
├── pnpm-workspace.yaml
├── package.json                # Root scripts
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── docker-entrypoint.sh    # Auto-seeds DB on first container start
│   └── src/
│       ├── index.ts            # Apollo Server entry point
│       ├── auth/
│       │   ├── jwt.ts          # Token signing and verification
│       │   └── context.ts      # Apollo context — extracts user from JWT
│       ├── db/
│       │   ├── connection.ts   # SQLite connection (better-sqlite3)
│       │   ├── schema.ts       # Table definitions (users, employees)
│       │   └── seed.ts         # Seeds 150 employees + admin user
│       └── schema/
│           ├── typeDefs/       # GraphQL type definitions
│           │   ├── auth.ts
│           │   ├── employees.ts
│           │   └── index.ts
│           └── resolvers/      # GraphQL resolvers
│               ├── auth.ts     # login, refreshToken
│               ├── employees/
│               │   ├── helper.ts
│               │   ├── queries.ts
│               │   └── mutations.ts
│               └── index.ts
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── .env.example
    ├── index.html
    └── src/
        ├── main.tsx            # Entry point — providers and router setup
        ├── App.tsx             # Route definitions
        ├── index.css           # Tailwind + CSS variables (light/dark)
        ├── routes/
        │   └── index.tsx       # Public and protected route config
        ├── shared/
        │   ├── apollo/
        │   │   └── client.ts   # Apollo Client with auth link + token refresh
        │   ├── ui/             # Reusable UI primitives (Button, Input, Dialog, etc.)
        │   ├── lib/
        │   │   └── utils.ts    # cn() utility for className merging
        │   ├── constants.ts
        │   ├── ThemeContext.tsx # Light/dark theme toggle
        │   └── ErrorBoundary.tsx
        └── features/
            ├── auth/
            │   ├── AuthContext.tsx  # Auth state, login/logout, token persistence
            │   ├── LoginPage.tsx    # Login form with validation
            │   ├── ProtectedRoute.tsx # Route guard
            │   ├── graphql.ts       # Auth-related GraphQL operations
            │   └── types.ts
            └── employees/
                ├── EmployeesPage.tsx  # Main dashboard page
                ├── components/        # Employee-specific UI components
                │   ├── EmployeeTable.tsx
                │   ├── EmployeesHeader.tsx
                │   ├── EmployeeToolbar.tsx
                │   ├── EmployeeFormDialog.tsx
                │   ├── EmployeeDetailDialog.tsx
                │   ├── DeleteEmployeeDialog.tsx
                │   └── columns.tsx
                ├── hooks/             # Custom hooks
                │   ├── useEmployees.ts
                │   ├── useEmployeeFilters.ts
                │   └── useEmployeeForm.ts
                ├── graphql.ts         # Employee-related GraphQL operations
                ├── excel.ts           # Excel import/export
                └── types.ts
```

---

## Architecture Decisions

### Data Fetching & Caching

**Apollo Client** serves as both the GraphQL client and the cache layer. The default cache mode is `cache-and-network`: Apollo returns cached data immediately (if available) then fetches fresh data from the server, updating the UI on arrival. Mutations (create/update/delete) trigger a manual `refetch()` to keep the employee table in sync. No separate state management library is needed — Apollo's normalized `InMemoryCache` handles deduplication and consistency.

### Authentication & Token Refresh

- **Login**: Client sends credentials via a GraphQL mutation. Server validates with `bcrypt`, returns a short-lived **access token** (15 min JWT) and a long-lived **refresh token** (7 day JWT). Both are stored in `localStorage`.
- **Why localStorage over cookies?** For a code test project, `localStorage` keeps things simple — no CSRF concerns since JWTs are sent via `Authorization` headers rather than cookies, and no need for `SameSite`/`Secure` cookie configuration. A production app handling money or sensitive PII would use HTTP-only cookies with a BFF (Backend-for-Frontend) pattern. But for this demo, localStorage is the pragmatic choice.
- **Request auth**: An Apollo auth link attaches the access token to every outgoing request via `Authorization: Bearer <token>`.
- **Token refresh**: An Apollo error link catches any response with `UNAUTHENTICATED` code. It calls the `refreshToken` mutation with the stored refresh token, receives new tokens, updates `localStorage`, and retries the original request — all transparent to the user. On refresh failure, all auth state is cleared and the user is redirected to `/login`.
- **Route protection**: `ProtectedRoute` checks `isAuthenticated` from `AuthContext` and redirects to `/login` if false.
- **Server-side**: The Apollo context function extracts and verifies the access token on every request. Resolvers call `requireAuth()` which throws `UNAUTHENTICATED` if the token is missing or invalid.

### Client-Side State

**React Context** is used for two cross-cutting concerns:

- **AuthContext** — access token, refresh token, user object, login/logout callbacks. Tokens and user are persisted to `localStorage`.
- **ThemeContext** — light/dark state, persisted to `localStorage` and synced with the `class` attribute on `<html>`.

Component-level state (`useState`) handles everything else: form field values, pagination page, search query, dialog open/close, delete confirmation target.

### Feature-Based Folder Structure

The client is organized by **feature**, not by file type. Everything related to employees lives under `features/employees/` — components, hooks, GraphQL operations, types, and Excel logic. Auth has its own directory: `features/auth/`.

```
features/
├── auth/           # Login page, AuthContext, ProtectedRoute, auth GraphQL
└── employees/      # Dashboard, table, forms, hooks, employee GraphQL
    ├── components/ # EmployeeTable, EmployeeFormDialog, EmployeeToolbar…
    ├── hooks/      # useEmployees, useEmployeeFilters, useEmployeeForm
    ├── graphql.ts  # Employee-specific queries and mutations
    ├── excel.ts    # Import/export logic
    └── types.ts    # Employee TypeScript types
```

Cross-cutting code that multiple features depend on lives in `shared/` (UI primitives, Apollo client, theme context, constants).

**Why features over file-type folders?** Grouping by file type (`components/`, `hooks/`, `pages/`) doesn't scale — as features grow, related files spread across the tree and make it hard to reason about a feature as a whole. Feature folders keep everything a developer needs for "employees" in one place. It also makes the code test easier to review: the reviewer can look at one directory and immediately see how employees are built end-to-end.

### GraphQL Server

**Apollo Server v4** runs in standalone mode at `POST /graphql`. The database is **better-sqlite3** — a synchronous, zero-config SQLite library. The schema uses a type-first approach: `typeDefs/` define the GraphQL types and operations, `resolvers/` implement the business logic.

### Why GraphQL Over REST

- **Single endpoint, flexible queries**: The client requests exactly the fields it needs (e.g., employee list omits `createdAt`/`updatedAt`, detail view includes them).
- **Schema as contract**: The GraphQL schema serves as self-documenting API documentation — no need for Swagger/OpenAPI.
- **Apollo ecosystem**: Built-in caching, error handling links, and DevTools make development faster.

### Why Vite Over Next.js

- **Simplicity**: No SSR/SSG complexity for a dashboard CRUD app.
- **Fast dev experience**: HMR is nearly instant.
- **Only what's needed**: No routing abstraction beyond React Router.

### Why SQLite

- Zero installation — the database is a single file created at runtime.
- `better-sqlite3` provides a synchronous API (no `await` needed), which pairs naturally with GraphQL resolver patterns.
- Perfect for a demonstration app — the reviewer doesn't need to install PostgreSQL or MySQL.

### Why Docker

- **Zero dependencies on the host**: The reviewer doesn't need Node.js, pnpm, or any build tools installed — just Docker.
- **One command to run**: `docker compose up --build` handles installing dependencies, building, seeding, and starting everything.
- **Consistent environment**: Eliminates "it works on my machine" issues.
- **Auto-seeding**: The entrypoint script automatically creates and populates the database on first run.

---

## Sample Excel File

A sample Excel file for testing the import feature is included at `client/public/sample-employees.xlsx`.

The expected columns are:

| ID  | First Name | Last Name | Email | Phone | Address | Salary | Join Date |
| --- | ---------- | --------- | ----- | ----- | ------- | ------ | --------- |
|     |            |           |       |       |         |        |           |

The ID column is optional — omit it to create new employees, include it to reference existing ones.
