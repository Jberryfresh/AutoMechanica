# INSTALLATION.md

# AutoMechanica — Installation Guide

This guide explains how to set up the AutoMechanica monorepo, configure environment variables, and run backend/frontend services.

---

## 1. Prerequisites

- Linux or macOS (Windows via WSL) or Windows with Docker Desktop
- Node.js 20+
- npm 11+ (workspace package manager)
- Git
- Docker + Docker Compose plugin (recommended for Postgres)
- (Alternative) PostgreSQL 15+ with the `vector` extension if not using Docker
- curl or HTTP client for health checks

---

## 2. Clone the Repository

```bash
git clone https://github.com/<your-username>/automechanica.git
cd automechanica
```

---

## 3. Environment Variables

Copy the templates and update values:

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

Key variables (see `docs/ENV_SETUP_GUIDE.md` for full descriptions):

- `DATABASE_URL` - Postgres connection string (defaults align with Docker Compose)
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` - database credentials for Docker Compose
- `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` / `PGADMIN_PORT` - optional pgAdmin UI credentials/port
- `PORT` - Backend port (default 3001)
- `FRONTEND_URL` - SPA origin (default http://localhost:5173)
- `BACKEND_URL` - API origin (default http://localhost:3001)
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — LLM credentials (optional until agents are enabled)
- `VITE_API_BASE_URL` — Frontend API base URL
- `ENABLE_REQUEST_LOGGING` — Enable HTTP request logging (default true)
- `SLOW_QUERY_THRESHOLD_MS` — Log DB queries slower than this threshold (ms)
- `API_RATE_LIMIT_PER_MINUTE` — Requests per minute per IP (global limiter)

Never commit populated `.env` files.

---

## 4. Install Dependencies

```bash
npm install
```

This installs workspace dependencies and wires Husky git hooks automatically via the root `prepare` script. If hooks are missing, run `npm run prepare`.

---

## 5. Database Setup

Preferred (Docker Compose with pgvector pre-enabled):

1. Ensure Docker is running.
2. Start PostgreSQL: `npm run db:start`
3. Watch logs until the health check passes: `npm run db:logs`
4. Verify connectivity and pgvector: `npm run db:test --workspace @automechanica/backend`
5. Open a psql shell if needed: `npm run db:shell`
6. (Optional) Start pgAdmin UI: `npm run pgadmin:start` then open `http://localhost:5050` (credentials in `.env`)
7. Reset data (destructive): `npm run db:reset`

Alternative (manual Postgres):

- Install PostgreSQL 15+ with the `vector` extension enabled.
- Ensure `DATABASE_URL` points to your instance and run `CREATE EXTENSION IF NOT EXISTS vector;`.

See `docs/DATABASE_MANAGEMENT.md` for common operations and troubleshooting tips.

---

## 6. Run the Backend

```bash
npm run dev --workspace @automechanica/backend
```

- API health: `http://localhost:3001/api/health`
- Logs include environment and routing information.

---

## 7. Run the Frontend

```bash
npm run dev --workspace @automechanica/frontend
```

Visit `http://localhost:5173` to view the Vite + React scaffold. Hot Module Replacement (HMR) is enabled by default.

---

## 8. Git Hooks

- Pre-commit: runs `lint-staged` to lint, format, and typecheck staged files.
- Commit message: enforces Conventional Commits (`type(scope): summary`).
- Hooks install automatically on `npm install`; re-run `npm run prepare` if needed.

---

## 9. Verifications

After installation, validate tooling:

```bash
npm run lint --workspaces
npm run typecheck --workspaces
npm run test --workspaces
```

Check the backend health endpoint and ensure the frontend renders brand colors and CTA buttons.

---

## 10. Troubleshooting

- Ensure Node.js 20+ is active (`node -v`).
- Verify `.env` files are present and correctly populated.
- If git hooks do not run, ensure scripts are executable (`chmod +x .husky/*`).
- For proxy environments, configure npm `https-proxy`/`proxy` and trust store as needed.
