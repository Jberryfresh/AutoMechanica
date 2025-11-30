# AutoMechanica

[![CI](https://github.com/AutoMechanica/AutoMechanica/actions/workflows/ci.yml/badge.svg)](https://github.com/AutoMechanica/AutoMechanica/actions/workflows/ci.yml)

AutoMechanica is an AI-powered automotive parts e-commerce platform engineered for reliable fitment, pricing, and customer support. The system combines strict TypeScript tooling, React + Tailwind UI, and AI-assisted agents to deliver production-ready workflows from day one.

## Repository Structure

- `packages/backend` — Express-based API server with strict typing, security middleware, and health monitoring
- `packages/frontend` — Vite + React + Tailwind SPA with brand-aligned UI scaffolding
- `packages/shared` — Shared types and utilities for cross-package reuse
- `packages/scripts` — Automation and tooling (reserved for future tasks)
- `docs` — Architecture, domain, and execution guides
- `.github/workflows` — Continuous integration pipelines

## Getting Started (5 minutes)

1. Ensure Node.js 20+ and npm 11+ are available.
2. Clone the repository and install dependencies with npm workspaces:
   ```bash
   npm install
   ```
3. Copy the environment templates and update values as needed:
   ```bash
   cp .env.example .env
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   ```
   Templates include sensible defaults for local backend and frontend URLs.
4. Run the backend API in development mode:
   ```bash
   npm run dev --workspace @automechanica/backend
   ```
5. In a separate terminal, start the frontend:
   ```bash
   npm run dev --workspace @automechanica/frontend
   ```
6. Visit `http://localhost:5173` to view the UI and `http://localhost:3001/api/health` for the API health check.

## Documentation

Key specifications live in `/docs`. Start with:

- [`docs/PROJECT_TODO.md`](docs/PROJECT_TODO.md) — Sequenced implementation plan and acceptance criteria
- [`docs/MAIN_PLAN.md`](docs/MAIN_PLAN.md) — Vision and architectural decisions
- [`docs/ARCHITECTURE_OVERVIEW.md`](docs/ARCHITECTURE_OVERVIEW.md) — Technical architecture and module boundaries
- [`docs/ENV_SETUP_GUIDE.md`](docs/ENV_SETUP_GUIDE.md) — Environment configuration details
- [`docs/CODE_STYLE_AND_CONVENTIONS.md`](docs/CODE_STYLE_AND_CONVENTIONS.md) — Coding standards and patterns

## Quality Gates

- `npm run lint --workspaces` — Run linting across all workspaces
- `npm run typecheck --workspaces` — Enforce strict TypeScript checks
- `npm run test --workspaces` — Execute backend and frontend test suites
- `npm run format:check` — Verify formatting consistency

## License

Proprietary — All rights reserved.
