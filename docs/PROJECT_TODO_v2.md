# PROJECT_TODO_v2.md

**Version**: 2.1 (Agent-Actionable)
**Last Updated**: 2025-12-21

Purpose: a concise, agent-executable project TODO derived from the repository research report. Each task includes: priority, file targets, acceptance criteria, tests, and estimated effort so an implementation agent can run with minimal ambiguity.

---

## Quick Index (pick a prioritized path)
- P0 Reliability & Correctness (Fix TaskQueue backoff + tests)
- P0 Security & Resilience (DB startup retry + Harden admin auth)
- P1 Observability & Tests (metrics, tracing, orchestrator integration tests)
- P1 LLM Safety (provider retries, cost caps)
- P2 Admin UX (dead-letter dashboard, rate limiting)

---

## Task Template (for each task)
- **Task ID**: short-id
- **Title**: one-line
- **Priority**: P0/P1/P2
- **Description**: short paragraph
- **Files (primary targets)**: list of workspace-relative paths
- **Implementation Notes**: step-by-step guidance for an agent
- **Acceptance Criteria**: testable checkboxes
- **Tests**: unit/integration/E2E to add
- **Estimated Effort**: hours

---

### Task: TODO-001 — Fix TaskQueue backoff arithmetic and add lifecycle tests
- **Priority**: P0
- **Description**: Ensure task retry/backoff and lease operations behave correctly under Postgres. Fix SQL arithmetic or code that calculates next run, add unit and integration tests covering enqueue → lease → fail → backoff → dead-letter.
- **Files (primary targets)**:
  - packages/backend/src/queue/TaskQueue.ts
  - packages/backend/src/queue/Worker.ts
  - packages/backend/db/migrations/* (if schema gaps found)
  - packages/backend/tests/unit/queue.test.ts (new)
  - packages/backend/tests/integration/queue.integration.test.ts (new)
- **Implementation Notes**:
  1. Inspect current lease and backoff code in `TaskQueue.ts` and `Worker.ts`. Identify any SQL using arithmetic operators or Postgres functions; prefer `power()` or compute backoff in application code to avoid operator ambiguity.
  2. Ensure backoff uses integer or numeric types appropriately and that time units are consistent (ms vs seconds).
  3. Add unit tests mocking DB client for arithmetic logic and integration tests using a test Postgres (container or local) to run full lifecycle.
  4. Add a dead-letter threshold config (max attempts) if missing and ensure task moves to dead-letter after max attempts.
  5. Document change in `docs/TASK_QUEUE_SPEC.md` (update or create the file).
- **Acceptance Criteria**:
  - [ ] Backoff arithmetic uses deterministic computation (either `power()` or app-level math) and passes unit tests
  - [ ] Integration test demonstrates lease→failure→backoff→dead-letter behavior
  - [ ] No SQL errors when running tests against Postgres 15+
  - [ ] Code includes clear config options for initialDelay, maxAttempts, multiplier
- **Tests**:
  - Unit: backoff calc, lease selection logic
  - Integration: end-to-end lifecycle with test DB
- **Estimated Effort**: 4–8 hours

### Task: TODO-002 — DB startup retry/backoff and graceful shutdown
- **Priority**: P0
- **Description**: Make server startup resilient to transient DB failures by implementing retry/backoff with a configurable number of attempts and exponential backoff. Add graceful shutdown and health gating.
- **Files (primary targets)**:
  - packages/backend/src/index.ts
  - packages/backend/src/db/client.ts
  - packages/backend/src/lib/env.ts
- **Implementation Notes**:
  1. Implement a DB connect wrapper with retry loop (exponential backoff, jitter). Default attempts: 5, base delay: 500ms.
  2. On persistent failure, expose a clear error and ensure process exits with non-zero after retries.
  3. Integrate health endpoint to reflect DB readiness in `packages/backend/src/api/health.ts`.
  4. Add unit tests mocking failed connections and verify retry behavior.
- **Acceptance Criteria**:
  - [ ] Startup retries at least 3 times before final failure
  - [ ] Health endpoint returns unhealthy until DB is ready
  - [ ] Graceful shutdown closes DB connections and worker loops
- **Tests**:
  - Unit test for retry logic
  - Local integration run to validate behavior with DB stopped/started
- **Estimated Effort**: 2–4 hours

### Task: TODO-003 — Harden admin auth (replace header-only key with JWT)
- **Priority**: P0
- **Description**: Replace the static header equality check with JWT-based short-lived tokens or rotating API keys and improve logging for unauthorized attempts.
- **Files (primary targets)**:
  - packages/backend/src/api/admin.ts
  - packages/backend/src/lib/env.ts
  - packages/backend/src/api/middleware/auth.ts (new)
- **Implementation Notes**:
  1. Add new middleware that validates an `Authorization: Bearer <token>` header.
  2. Tokens are JWT signed with a symmetric key from env `ADMIN_JWT_SECRET` or public/private pair; allow option to accept static API keys for backward compatibility behind a feature flag.
  3. Add endpoints to rotate keys or document rotation process.
  4. Add unit tests for middleware and integration tests hitting admin routes.
- **Acceptance Criteria**:
  - [ ] Admin endpoints reject missing/invalid tokens with 401
  - [ ] Valid token allows admin operations
  - [ ] Logs contain no raw secret values
- **Tests**:
  - Unit tests for middleware
  - Integration test covering admin endpoints
- **Estimated Effort**: 3–6 hours

---

