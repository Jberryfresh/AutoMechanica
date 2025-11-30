# ENV_SETUP_GUIDE.md

# AutoMechanica — Environment Setup & Configuration Guide

This guide documents every environment variable, validation rules, and best practices for configuring AutoMechanica across development and production.

---

## 1. System Requirements

- Linux (preferred), macOS (supported), Windows via WSL
- Node.js 20+
- npm 11+
- PostgreSQL 14+ with `vector` extension
- Git

---

## 2. Repository Structure Overview

```
/packages/backend    # API server
/packages/frontend   # React SPA
/packages/shared     # Shared types and utilities
/docs                # Specifications
```

---

## 3. Environment Variables

### 3.1 Templates

Copy example files and customize for your environment:

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

Root `.env` is used by the backend, while the frontend reads `VITE_*` values from `packages/frontend/.env` during local builds.

### 3.2 Variable Reference

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/automechanica` | PostgreSQL connection string used by backend services. |
| `POSTGRES_USER` | No | `automechanica` | Convenience defaults for local DB creation. |
| `POSTGRES_PASSWORD` | No | `dev_password_change_in_production` | Local DB password. |
| `POSTGRES_DB` | No | `automechanica` | Local database name. |
| `PORT` | No | `3001` | Backend HTTP port. |
| `NODE_ENV` | No | `development` | Runtime mode (`development`, `test`, `production`). |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed CORS origin for the SPA. |
| `BACKEND_URL` | Yes | `http://localhost:3001` | Public API base URL. |
| `OPENAI_API_KEY` | Optional | _none_ | API key for OpenAI provider. |
| `ANTHROPIC_API_KEY` | Optional | _none_ | API key for Anthropic provider. |
| `GOOGLE_API_KEY` | Optional | _none_ | API key for Google/Gemini provider. |
| `DEFAULT_LLM_PROVIDER` | No | `openai` | Default LLM provider identifier. |
| `DEFAULT_LLM_MODEL` | No | `gpt-4-turbo-preview` | Default LLM model. |
| `EMBEDDING_MODEL` | No | `text-embedding-3-large` | Embedding model name. |
| `TASK_POLL_INTERVAL_MS` | No | `5000` | Worker poll interval in milliseconds. |
| `MAX_CONCURRENT_TASKS` | No | `5` | Maximum tasks processed concurrently. |
| `TASK_TIMEOUT_MS` | No | `300000` | Task timeout in milliseconds. |
| `VECTOR_DIMENSIONS` | No | `3072` | Embedding vector size. |
| `VECTOR_SIMILARITY_THRESHOLD` | No | `0.7` | Similarity threshold for vector comparisons. |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`error`, `warn`, `info`, `debug`). |
| `ENABLE_REQUEST_LOGGING` | No | `true` | Toggle HTTP request logging. |
| `VITE_API_BASE_URL` | Yes (frontend) | `http://localhost:3001` | API base URL exposed to the SPA. |
| `VITE_APP_NAME` | No | `AutoMechanica` | UI display name. |
| `VITE_ENABLE_MOCKS` | No | `false` | Enables mock responses in the SPA. |

### 3.3 Validation Rules

- Backend validation runs at startup via `packages/backend/src/lib/env.ts` and fails fast on missing/invalid variables.
- Frontend validation runs during bundle init (`packages/frontend/src/lib/config.ts`) and throws if required `VITE_*` variables are absent.
- Ports must be within `1-65535`. Boolean flags accept `true/false/0/1`.

### 3.4 Precedence

1. Process environment variables (e.g., Kubernetes/OS-level)
2. `.env` files loaded via `dotenv`
3. Defaults defined in validation schemas

---

## 4. Database Setup

1. Install PostgreSQL and enable pgvector:

   ```bash
   sudo apt install postgresql postgresql-contrib
   psql -c "CREATE EXTENSION IF NOT EXISTS vector;" -d postgres
   createdb automechanica
   ```

2. Confirm `DATABASE_URL` points to the created database.
3. Future migrations will align with `docs/DOMAIN_MODEL.md`.

---

## 5. Running the Backend

```bash
npm run dev --workspace @automechanica/backend
```

- Health endpoint: `http://localhost:3001/api/health`
- CORS is restricted to `FRONTEND_URL`
- Logging respects `LOG_LEVEL` and `ENABLE_REQUEST_LOGGING`

---

## 6. Running the Frontend

```bash
npm run dev --workspace @automechanica/frontend
```

The SPA reads `VITE_*` variables from `packages/frontend/.env`. Never store secrets in `VITE_*` variables—they are embedded in the client bundle.

---

## 7. Security Best Practices

- Do **not** commit `.env` files; only commit `.env.example` templates.
- Rotate API keys regularly and restrict permissions in provider dashboards.
- Use separate credentials per environment (dev/staging/prod).
- Limit CORS origins to trusted hosts in production.
- Store secrets in a vault (e.g., AWS Secrets Manager, GCP Secret Manager) rather than plain environment files in production.

---

## 8. Troubleshooting

- **Validation failed**: Check console output for missing or malformed variables and update your `.env` accordingly.
- **CORS errors**: Ensure `FRONTEND_URL` matches the origin you are loading the SPA from.
- **Connection refused**: Verify PostgreSQL is running and `DATABASE_URL` hostname/port are correct.
- **Proxy environments**: Configure `npm config set https-proxy <proxy-url>` (and `npm config set proxy` if required) and trust the corporate CA if needed.

---

## 9. Verification Checklist

- [ ] `.env` files exist in root, backend, and frontend
- [ ] Backend starts without validation errors
- [ ] `/api/health` returns `status: ok`
- [ ] Frontend renders without configuration errors
- [ ] CORS requests succeed from the configured frontend origin
