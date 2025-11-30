# INSTALLATION.md

# AutoMechanica — Installation Guide

This guide explains how to set up the AutoMechanica monorepo, configure environment variables, and run backend/frontend services.

---

## 1. Prerequisites

- Linux or macOS (Windows via WSL)
- Node.js 20+
- npm 11+ (workspace package manager)
- Git
- PostgreSQL 14+ with the `vector` extension
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

- `DATABASE_URL` — Postgres connection string
- `PORT` — Backend port (default 3001)
- `FRONTEND_URL` — SPA origin (default http://localhost:5173)
- `BACKEND_URL` — API origin (default http://localhost:3001)
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — LLM credentials (optional until agents are enabled)
- `VITE_API_BASE_URL` — Frontend API base URL

Never commit populated `.env` files.

---

## 4. Install Dependencies

```bash
npm install
```

This installs workspace dependencies and wires Husky git hooks automatically via the root `prepare` script. If hooks are missing, run `npm run prepare`.

---

## 5. Database Setup

1. Install PostgreSQL and enable pgvector:

   ```bash
   sudo apt install postgresql postgresql-contrib
   psql -c "CREATE EXTENSION IF NOT EXISTS vector;" -d postgres
   createdb automechanica
   ```

2. Ensure `DATABASE_URL` points to the created database.
3. Migrations will be added in later phases; rerun them as tasks arrive.

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
