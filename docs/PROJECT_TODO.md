# PROJECT_TODO.md

# AutoMechanica — Project Execution TODO (Detailed)

This file is the **master build plan** for the AutoMechanica project.

Codex, follow this file **sequentially by Phase and Task ID**, unless explicitly instructed otherwise.

This TODO is intentionally verbose and highly structured so that an AI coding assistant can implement the entire system step-by-step with minimal ambiguity.

---

## 0. How to Use This File (READ FIRST)

- Work in **phases**, in order: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7.
- Within each phase, tasks are grouped by **increments** (1.1, 1.2, 2.1, etc.).
- Each task has:
  - A checkbox for status
  - A **priority** (P0–P3) with emoji
  - A short description
  - Detailed implementation notes
  - Acceptance criteria
  - Files to create/update
  - Tests expected
  - Metadata section for CI/PR tracking

**Status Legend**

- `[ ]` = Not started  
- `[🔲]` = In progress  
- `[✓]` = Done  

**Priority Legend**

- 🔴 **P0-CRITICAL** — Blocking; must be completed for the phase to be meaningful  
- 🟡 **P1-HIGH** — Very important; usually near the critical path  
- 🟢 **P2-MEDIUM** — Valuable but not strictly blocking  
- 🔵 **P3-LOW** — Nice-to-have; can be deferred

**Important References**

When implementing tasks, Codex should read and follow:

- `/docs/MAIN_PLAN.md`
- `/docs/ARCHITECTURE_OVERVIEW.md`
- `/docs/DOMAIN_MODEL.md`
- `/docs/AGENTS_AND_WORKFLOWS.md`
- `/docs/LLM_ROUTER_SPEC.md`
- `/docs/TASK_QUEUE_SPEC.md`
- `/docs/VECTOR_MEMORY_DESIGN.md`
- `/docs/EVALUATION_FRAMEWORK.md`
- `/docs/FRONTEND_UX_SPEC.md`
- `/docs/BRAND_GUIDE.md`
- `/docs/VOICE_TONE_GUIDE.md`
- `/docs/ENV_SETUP_GUIDE.md`
- `/docs/SUPPORT_POLICY.md`
- `/docs/INSTALLATION.md`
- `/docs/DEPLOYMENT.md`
- `/docs/API_REFERENCE.md`
- `/docs/CODE_STYLE_AND_CONVENTIONS.md`

Do **not** invent architecture that contradicts these docs. If a conflict appears, prefer the docs over this TODO.

---

## PHASE 1 — Repo, Docs, and Environment Foundation

**Goal:** Have a clean repo, documentation in place, and a working dev environment with Postgres + pgvector.

This phase does not implement business logic. It lays the foundation for everything else.

---

### 1.1 — Repository & Docs Scaffolding

#### 1.1.1 — Create base repo structure

- [ ] 🔴 **P0-CRITICAL** — Initialize repo & core folders

**Description**  
Create the root project layout and basic config files. This should match the structure assumed by all design docs.

**Implementation Notes for Codex**

1. At repository root, create the following directories:
   - `/backend`
   - `/frontend`
   - `/docs`
   - `/scripts`
2. Create a top-level `README.md` with:
   - Short project description (what AutoMechanica is)
   - A “Documents” section linking to key files in `/docs`
   - A “Getting Started” section that points to `INSTALLATION.md`
3. Create a `.gitignore` that includes:
   - `node_modules/`
   - `dist/`, `build/`
   - `.env`, `.env.*`
   - `coverage/`
   - `.DS_Store`
   - Any framework-specific temp files
4. Do **not** add generated build artifacts to the repo.

**Acceptance Criteria**

- Root directories `/backend`, `/frontend`, `/docs`, `/scripts` exist.
- `README.md` describes AutoMechanica at a high level and references design docs.
- `.gitignore` prevents all obvious Node/TS build artifacts and secrets from being committed.

**Files**

- `README.md`
- `.gitignore`
- Root folder skeleton

**Tests**

- None (structure only).

**Metadata**

- Branch: `feature/phase1-repo-structure`  
- StartedBy:  
- CompletedBy:  
- CompletedAt:  
- PR:  
- Commit:  

---

#### 1.1.2 — Place architecture/design docs into /docs

- [ ] 🔴 **P0-CRITICAL** — Copy spec documents into repo

**Description**  
Persist all previously generated design documents into `/docs` so that Codex and developers can reference them consistently.

**Implementation Notes for Codex**

1. Ensure the following files exist under `/docs`:
   - `MAIN_PLAN.md`
   - `ARCHITECTURE_OVERVIEW.md`
   - `DOMAIN_MODEL.md`
   - `AGENTS_AND_WORKFLOWS.md`
   - `LLM_ROUTER_SPEC.md`
   - `TASK_QUEUE_SPEC.md`
   - `VECTOR_MEMORY_DESIGN.md`
   - `EVALUATION_FRAMEWORK.md`
   - `FRONTEND_UX_SPEC.md`
   - `BRAND_GUIDE.md`
   - `VOICE_TONE_GUIDE.md`
   - `ENV_SETUP_GUIDE.md`
   - `SUPPORT_POLICY.md`
   - `INSTALLATION.md`
   - `DEPLOYMENT.md`
   - `API_REFERENCE.md`
   - `CODE_STYLE_AND_CONVENTIONS.md`
   - `PROJECT_TODO.md` (this file)
2. Ensure that file names match exactly what the docs expect (case-sensitive).
3. Do **not** modify content beyond adding an optional `/docs/INDEX.md` linking them if desired.

**Acceptance Criteria**

- All documents present in `/docs` with matching names.
- There is no placeholder “lorem ipsum” in any of these doc files.

**Files**

- `/docs/*.md`

**Tests**

- None.

**Metadata**

- Branch: `feature/phase1-repo-structure`  

---

### 1.2 — Environment & Tooling

#### 1.2.1 — Backend TypeScript + tooling scaffold

- [ ] 🔴 **P0-CRITICAL** — Setup backend project

**Description**  
Create the Node/TypeScript backend project in `/backend` with scripts, linting, and a minimal HTTP server exposing `/api/health`.

**Implementation Notes for Codex**

1. In `/backend`:
   - Initialize a Node project (`npm init -y` equivalent content).
   - Add TypeScript, ts-node (or tsx), Jest/Vitest, ESLint, Prettier as dev dependencies.
2. Create `tsconfig.json` with:
   - `"strict": true`
   - Reasonable module/target settings for Node (ESNext modules if using ESM or CommonJS consistently).
3. Add scripts in `backend/package.json`, such as:
   - `"dev"`: run server in watch mode (e.g., `tsx src/index.ts` or `ts-node-dev src/index.ts`)
   - `"build"`: compile TypeScript to `dist`
   - `"start"`: run compiled server from `dist`
   - `"test"`: run unit tests
   - `"lint"`: run ESLint
4. Implement `src/index.ts`:
   - Create an Express or minimal HTTP server.
   - Mount `GET /api/health` endpoint that returns JSON: `{ success: true, data: { status: "ok" } }`.
   - Read port from env (`PORT` with a default, e.g., 3001).
5. Configure ESLint + Prettier according to `CODE_STYLE_AND_CONVENTIONS.md`:
   - 2-space indentation
   - Semicolons required
   - Single quotes
   - No unused variables
   - No `any` unless absolutely necessary

**Acceptance Criteria**

- `npm run dev` starts the backend server and exposes `/api/health`.
- `/api/health` returns a valid JSON response and status code 200.
- TypeScript builds without errors (`npm run build`).
- Lint and tests run without crashing (even if tests are minimal).

**Files**

- `/backend/package.json`
- `/backend/tsconfig.json`
- `/backend/src/index.ts`
- `/backend/src/api/health.ts` (or inline in index)
- ESLint + Prettier config files

**Tests**

- Backend test that makes an HTTP call to `/api/health` and asserts `success: true`.

**Metadata**

- Branch: `feature/phase1-backend-scaffold`  

---

#### 1.2.2 — Frontend React + Tailwind scaffold

- [ ] 🟡 **P1-HIGH** — Setup frontend project

**Description**  
Create a React + Tailwind frontend in `/frontend` with a basic layout, brand colors, and a placeholder home page.

**Implementation Notes for Codex**

1. Choose framework:
   - Next.js **or** Vite + React Router (either is acceptable; just be consistent).
2. Initialize project under `/frontend`.
3. Install Tailwind and set up:
   - `tailwind.config.*` with theme extended to include AutoMechanica brand colors from `BRAND_GUIDE.md`:
     - Electric Teal, Deep Navy, Gunmetal Gray, etc.
   - `postcss.config.*` and `index.css` / `globals.css` with Tailwind directives.
4. Implement a simple layout with:
   - Header (`AutoMechanica` brand title)
   - Placeholder nav
   - Footer
   - Home page messaging: “Select your vehicle to get started.”
5. Configure `npm run dev`, `npm run build`, `npm run test`.

**Acceptance Criteria**

- `npm run dev` in `/frontend` starts a development server.
- Home page renders with AutoMechanica branding colors.
- Header and footer appear on all main pages.
- Tailwind classes are applied correctly.

**Files**

- `/frontend/package.json`
- `/frontend/tailwind.config.*`
- `/frontend/src/components/Header.tsx`
- `/frontend/src/components/Footer.tsx`
- `/frontend/src/pages` or `/frontend/src/routes` depending on framework

**Tests**

- Smoke test rendering the home page.

**Metadata**

- Branch: `feature/phase1-frontend-scaffold`  

---

#### 1.2.3 — ENV & INSTALLATION alignment

- [ ] 🟡 **P1-HIGH** — Sync `.env.example` with docs

**Description**  
Create environment example files and ensure they match the keys required by the backend code and `ENV_SETUP_GUIDE.md` / `INSTALLATION.md`.

**Implementation Notes for Codex**

1. At root (or in `/backend`), create `.env.example` with at least:
   - `DATABASE_URL=postgres://user:password@localhost:5432/automechanica`
   - `OPENAI_API_KEY=`
   - `ANTHROPIC_API_KEY=`
   - `EMBEDDING_MODEL=text-embedding-3-large`
   - `PORT=3001`
2. Ensure backend reads configuration using `process.env`.
3. Update `INSTALLATION.md` and/or `ENV_SETUP_GUIDE.md` if new variables are introduced.
4. Confirm that no secrets are hard-coded in the codebase.

**Acceptance Criteria**

- `.env.example` exists and can be copied to `.env` to allow the app to run locally.
- Application does not crash on missing optional keys but fails clearly if required keys are missing.

**Files**

- `.env.example`
- Possibly `/backend/.env.example`

**Tests**

- Manual: run backend with `.env` derived from `.env.example` and confirm it starts successfully.

---

## PHASE 2 — Database, Domain Model & Migrations

**Goal:** Implement the relational schema from `DOMAIN_MODEL.md` with migrations, models, and basic data access.

---

### 2.1 — Postgres & pgvector Setup in Code

#### 2.1.1 — DB client and config

- [ ] 🔴 **P0-CRITICAL** — Setup DB connection layer

**Description**  
Create a single database access layer that can be reused across the backend services, using either an ORM (Prisma, Sequelize) or a query builder (Knex). Follow `CODE_STYLE_AND_CONVENTIONS.md`.

**Implementation Notes for Codex**

1. Choose one approach:
   - Prisma (recommended for strong typing)
   - Knex + custom models
2. Implement `/backend/src/db/client.ts` (or similar) that:
   - Reads `DATABASE_URL` from env.
   - Creates a pooled connection.
   - Exports a singleton client instance.
3. Handle connection errors gracefully:
   - Log meaningful error messages.
   - Exit or throw when DB is unreachable at startup.
4. If Prisma:
   - Generate schema that matches `DOMAIN_MODEL.md`.
   - Ensure migrations are set up with `prisma migrate`.
5. Ensure this DB client is imported by models and not recreated multiple times.

**Acceptance Criteria**

- Backend can connect to Postgres using the configured DB client.
- A failing DB connection produces a clear log message and does not silently succeed.

**Files**

- `/backend/src/db/client.ts`
- ORM-specific config (`prisma/schema.prisma` or equivalent)

**Tests**

- A small test that imports the DB client and asserts it can run a trivial query (e.g. `SELECT 1`).

---

#### 2.1.2 — pgvector extension support

- [ ] 🔴 **P0-CRITICAL** — Ensure pgvector integration

**Description**  
Integrate pgvector support according to `VECTOR_MEMORY_DESIGN.md` and ensure the database is prepared to store vector columns.

**Implementation Notes for Codex**

1. Create a migration that executes:
   - `CREATE EXTENSION IF NOT EXISTS vector;`
   - Only if the DB user has permission (if not, document the manual step in `ENV_SETUP_GUIDE.md`).
2. Document fallback:
   - If migration cannot create the extension, add a note in `INSTALLATION.md` that the operator must do it manually before running.
3. Confirm that the ORM / migration tool supports `vector` type columns (Prisma may require `@db.Vector` or raw SQL migrations; Knex may use `specificType`).

**Acceptance Criteria**

- The `vector` extension is created (or clearly documented if manual).
- Later migrations for vector tables (`agent_event_embeddings`, etc.) can succeed.

**Files**

- Migration file for pgvector.
- Updated docs if necessary.

**Tests**

- A migration test that confirms the extension exists (if feasible) or at least that vector columns can be created during subsequent migrations.

---

### 2.2 — Core Tables (Vehicles, Parts, SupplierParts, Fitments)

#### 2.2.1 — Vehicles table & model

- [ ] 🔴 **P0-CRITICAL** — Implement `vehicles` schema

**Description**  
Create the Vehicle table and model exactly as described in `DOMAIN_MODEL.md`.

**Implementation Notes for Codex**

1. Add migration for `vehicles` with columns:
   - `id` (UUID, primary key)
   - `year` (INT)
   - `make` (TEXT)
   - `model` (TEXT)
   - `trim` (TEXT)
   - `engine` (TEXT)
   - `created_at` (TIMESTAMP, default now)
2. Add unique constraint:
   - `(year, make, model, trim, engine)` must be unique.
3. In `/backend/src/models/Vehicle.ts`:
   - Implement helper functions:
     - `createVehicle(data)`
     - `findVehicleById(id)`
     - `findOrCreateByKey(year, make, model, trim, engine)`
4. Use strong typing for vehicle props.

**Acceptance Criteria**

- Migration runs successfully and creates the table with correct columns and unique index.
- Model functions work in tests (can create and query vehicles).

**Files**

- `vehicles` migration
- `/backend/src/models/Vehicle.ts`

**Tests**

- Unit tests for `createVehicle` and uniqueness constraint (attempting duplicate should fail).

---

#### 2.2.2 — Parts, SupplierParts, Fitments tables & models

- [ ] 🔴 **P0-CRITICAL** — Implement core part-related tables

**Description**  
Implement the core entities for canonical parts, supplier parts, and fitment relationships.

**Implementation Notes for Codex**

1. Implement `parts` table:
   - `id` (UUID PK)
   - `name` (TEXT)
   - `category` (TEXT)
   - `brand` (TEXT)
   - `description` (TEXT, nullable)
   - `attributes` (JSONB)
   - `created_at` (TIMESTAMP)
2. Implement `supplier_parts` table:
   - `id` (UUID PK)
   - `supplier_id` (TEXT)
   - `supplier_sku` (TEXT)
   - `raw_data` (JSONB)
   - `normalized_data` (JSONB, nullable)
   - `canonical_part_id` (UUID FK → parts.id, nullable)
   - `cost` (NUMERIC)
   - `availability` (TEXT)
   - `lead_time_days` (INT)
   - `created_at` (TIMESTAMP)
   - Unique `(supplier_id, supplier_sku)`
3. Implement `fitments` table:
   - `id` (UUID PK)
   - `canonical_part_id` (UUID FK → parts.id)
   - `vehicle_id` (UUID FK → vehicles.id)
   - `confidence` (FLOAT)
   - `evidence` (JSONB)
   - `source` (TEXT)
   - `created_at` (TIMESTAMP)
4. Implement models:
   - `/backend/src/models/Part.ts`
   - `/backend/src/models/SupplierPart.ts`
   - `/backend/src/models/Fitment.ts`
5. Provide helper functions:
   - For Parts:
     - `createPart(data)`
     - `getPartById(id)`
     - `listPartsByCategory(category, filters)`
   - For SupplierParts:
     - `createSupplierPart(raw)`
     - `attachCanonicalPart(supplierPartId, canonicalPartId)`
   - For Fitments:
     - `createFitment(record)`
     - `listFitmentsForPart(partId)`
     - `listFitmentsForVehicle(vehicleId)`

**Acceptance Criteria**

- Migrations run successfully and tables exist with correct FKs and unique constraints.
- Basic CRUD operations for each model work in tests.

**Files**

- Migrations for `parts`, `supplier_parts`, `fitments`
- Model files

**Tests**

- Model tests covering:
  - Part creation
  - SupplierPart creation + mapping to Part
  - Fitment linking part ↔ vehicle

---

### 2.3 — Orders & Workflows Basic Schema

#### 2.3.1 — Orders & OrderLines

- [ ] 🟡 **P1-HIGH** — Implement order schema

**Description**  
Implement `orders` and `order_lines` tables and models to support basic checkout.

**Implementation Notes for Codex**

1. `orders` table columns:
   - `id` (UUID PK)
   - `user_id` (UUID nullable)
   - `status` (TEXT, e.g. “pending”, “confirmed”, “fulfilled”, “cancelled”)
   - `total_amount` (NUMERIC)
   - `shipping_address` (JSONB)
   - `created_at`, `updated_at` (TIMESTAMP)
2. `order_lines` table:
   - `id` (UUID PK)
   - `order_id` (UUID FK → orders.id)
   - `canonical_part_id` (UUID FK → parts.id)
   - `quantity` (INT)
   - `final_price` (NUMERIC)
   - `fitment_confidence` (FLOAT)
   - `created_at`
3. Models:
   - `/backend/src/models/Order.ts`
   - `/backend/src/models/OrderLine.ts`
4. Add helper functions:
   - `createOrder(orderData, lineItems)`
   - `getOrderById(id)`
   - `updateOrderStatus(id, status)`

**Acceptance Criteria**

- Orders and order lines can be created and retrieved in tests.
- Foreign keys enforce valid relationships.

**Files**

- Migrations for `orders`, `order_lines`
- Models

**Tests**

- Test that creating an order with multiple lines persists correctly and sums the totals as expected.

---

#### 2.3.2 — Workflows & AgentEvents

- [ ] 🔴 **P0-CRITICAL** — Implement workflow + agent event logging schema

**Description**  
Create `workflows` and `agent_events` entities needed by the Orchestrator, agents, and memory system.

**Implementation Notes for Codex**

1. `workflows` table:
   - `id` (UUID PK)
   - `type` (TEXT) — e.g. `wf_ingest_supplier_catalog`, `wf_process_customer_order`
   - `state` (TEXT) — “pending”, “running”, “completed”, “failed”
   - `context` (JSONB)
   - `created_at`, `updated_at`
2. `agent_events` table:
   - `id` (UUID PK)
   - `workflow_id` (UUID FK → workflows.id, nullable for free-form events)
   - `agent_name` (TEXT)
   - `task_type` (TEXT)
   - `input_data` (JSONB)
   - `output_data` (JSONB)
   - `reasoning` (TEXT)
   - `created_at`
3. Implement models:
   - `/backend/src/models/Workflow.ts`
   - `/backend/src/models/AgentEvent.ts`
4. Provide helper functions:
   - `createWorkflow(type, initialContext)`
   - `updateWorkflowState(id, newState, contextPatch?)`
   - `logAgentEvent(eventData)`

**Acceptance Criteria**

- Ability to create workflows and associated AgentEvents.
- Reasoning text is stored reliably for embedding generation later.

**Files**

- Migrations
- Model files

**Tests**

- Test a simple workflow creation and logging of at least one AgentEvent.

---

## PHASE 3 — Task Queue, Orchestrator, and LLM Router (MVP)

**Goal:** Implement functional task queue, Orchestrator skeleton, and LLM Router with stubbed models/routes.

---

### 3.1 — Task Queue Implementation

#### 3.1.1 — `tasks` table & leasing logic

- [ ] 🔴 **P0-CRITICAL** — Implement queue schema and leasing

**Description**  
Implement the `tasks` table and leasing/backoff mechanism exactly as specified in `TASK_QUEUE_SPEC.md`.

**Implementation Notes for Codex**

1. Create `tasks` table with fields:
   - `id` (UUID PK)
   - `workflow_id` (UUID FK → workflows.id, nullable)
   - `agent_name` (TEXT)
   - `task_type` (TEXT)
   - `payload` (JSONB)
   - `priority` (INT, lower = higher priority)
   - `status` (TEXT) — “pending”, “leased”, “running”, “completed”, “failed”, “dead”
   - `attempts` (INT)
   - `max_attempts` (INT)
   - `available_at` (TIMESTAMP)
   - `lease_owner` (TEXT nullable)
   - `lease_expires_at` (TIMESTAMP nullable)
   - `error_info` (JSONB)
   - `created_at`, `updated_at`
2. Implement queue helper:
   - `enqueueTask(taskData)`
   - `leaseNextTask(agentName | workerId)` using `FOR UPDATE SKIP LOCKED`
   - `markTaskCompleted(id)`
   - `markTaskFailed(id, errorInfo)`
   - `requeueWithBackoff(id)`
3. Implement backoff:
   - `available_at = now() + (attempts^2 * base_delay)`; choose base_delay (e.g. 5 seconds) and make configurable.

**Acceptance Criteria**

- Tasks can be enqueued, leased by workers, completed, retried, and moved to `dead` after exceeding max attempts.
- Only one worker gets a lease on a given task at a time.

**Files**

- Migration for `tasks`
- `/backend/src/queue/TaskQueue.ts`

**Tests**

- Unit tests that:
  - Enqueue tasks with different priorities.
  - Lease tasks from multiple workers; no duplicates.
  - Confirm backoff scheduling.
  - Confirm tasks become `dead` after final failure.

---

#### 3.1.2 — Worker loop abstraction

- [ ] 🔴 **P0-CRITICAL** — Build worker framework

**Description**  
Implement a generic worker loop that different agent worker processes can reuse to process tasks.

**Implementation Notes for Codex**

1. Create `Worker` abstraction:
   - Configurable `agentName` or `taskHandlerMap`.
   - Loop:
     - Lease task
     - Mark `status = running`
     - Execute handler
     - Mark `status = completed` or `failed`
     - Sleep briefly before next iteration.
2. Ensure lease renewal if task takes longer than lease duration:
   - Periodically extend `lease_expires_at`.
3. Provide a CLI entry script:
   - `npm run worker:fitment` may call `createWorker("FitmentAgent")`, etc.
4. Handler signature suggestion:
   - `async function handleTask(task: QueuedTask): Promise<void>`

**Acceptance Criteria**

- Sample worker can process a dummy `echo_task` and update task states correctly.
- Worker can be gracefully stopped with a signal (optional but ideal).

**Files**

- `/backend/src/queue/Worker.ts`
- `/backend/src/queue/index.ts` (optional)
- Scripts in `backend/package.json` for worker startup.

**Tests**

- Simulated worker test that processes fake tasks without crashing.

---

### 3.2 — Orchestrator MVP

#### 3.2.1 — Orchestrator module & workflow registry

- [ ] 🔴 **P0-CRITICAL** — Implement orchestrator core

**Description**  
Implement an Orchestrator service that owns workflow creation, state transitions, and task emission.

**Implementation Notes for Codex**

1. Create `/backend/src/orchestrator/Orchestrator.ts` with functions:
   - `startWorkflow(type, initialContext)`
   - `handleTaskResult(task, result)`
   - `transitionWorkflowState(workflowId, nextState, contextPatch?)`
2. Create `/backend/src/workflows/registry.ts`:
   - Defines workflow configs (e.g. `wf_ingest_supplier_catalog`, `wf_publish_new_part`).
   - Each workflow config describes the initial tasks and how to proceed after each task result.
3. Initial implementation can be simple:
   - For MVP, implement a “dummy” workflow for internal testing (e.g., `wf_dummy` that just runs a single logging agent).
4. Ensure that Orchestrator:
   - Always logs decisions in `agent_events` or separate logs.
   - Uses the queue to schedule tasks, not direct function calls.

**Acceptance Criteria**

- Orchestrator can start a basic workflow and create at least one task.
- When worker completes the task, Orchestrator can mark workflow `completed`.

**Files**

- `/backend/src/orchestrator/Orchestrator.ts`
- `/backend/src/workflows/registry.ts`

**Tests**

- Workflow test: start `wf_dummy`, ensure tasks created and workflow finishes.

---

### 3.3 — LLM Router MVP

#### 3.3.1 — Router core + provider adapters

- [ ] 🔴 **P0-CRITICAL** — Implement LLM Router skeleton

**Description**  
Implement the provider-agnostic LLM Router described in `LLM_ROUTER_SPEC.md`, with clear TaskType-based routing and mockable providers.

**Implementation Notes for Codex**

1. Create `/backend/src/llm/router.ts` with:
   - `async routeLLM(taskType, payload): Promise<RouterResult>`
   - Internally uses a routing table to select provider/model.
2. Implement provider adapters:
   - `/backend/src/llm/providers/openai.ts`
   - `/backend/src/llm/providers/anthropic.ts`
   - `/backend/src/llm/providers/local.ts` (for local/Ollama or stubbed test models)
3. Implement TaskTypes per spec:
   - `meta_reasoning`, `fitment_analysis`, `pricing_reasoning`, `seo_generation`, `support_reply`, `normalization`, `matching`, `lightweight`, `safety_check`.
4. Make Router output match unified response structure:
   - `{ output, reasoning, modelUsed, tokens, cost_estimate, timestamp }`
5. Implement error handling:
   - Retry/fallback logic for provider errors.
   - Schema validation or at least JSON parse validation if applicable.

**Acceptance Criteria**

- Router can be called with a known taskType and payload and returns a normalized response.
- Routing decisions are logged (model used, taskType, latency).
- All providers can be mocked in tests.

**Files**

- `/backend/src/llm/router.ts`
- Provider adapter modules
- Config constants (e.g. model names, tokens per $ estimation)

**Tests**

- Router tests with stubbed provider implementations, verifying fallback behavior and correct routing for each TaskType.

---

## PHASE 4 — Agents & Workflows (Core Business Logic)

**Goal:** Implement core agents and key workflows: supplier ingestion, part publication, and initial fitment/pricing/content flows.

---

### 4.1 — Core Agents Implementation

#### 4.1.1 — Supplier Normalization Agent

- [ ] 🔴 **P0-CRITICAL** — Implement SupplierNormalizationAgent

**Description**  
Implement an agent that takes raw supplier part data and normalizes it into standardized fields.

**Implementation Notes for Codex**

1. Create `/backend/src/agents/SupplierNormalizationAgent.ts` with:
   - `async runTask(task: Task): Promise<void>`
   - Reads supplier_part from DB using `task.payload.supplierPartId`.
   - Uses LLM Router with TaskType `normalization` when needed.
2. Responsibilities:
   - Map raw fields to standard attributes (position, material, brand normalization).
   - Write normalized attributes into `supplier_parts.normalized_data`.
   - Optionally flag clearly invalid or incomplete parts.
3. Logging:
   - Write an AgentEvent capturing:
     - agent_name = "SupplierNormalizationAgent"
     - task_type = "normalize_supplier_part"
     - input_data = supplier raw snippet
     - output_data = normalized attributes
     - reasoning = short summary of mapping logic.

**Acceptance Criteria**

- Given sample raw supplier data, agent produces a structured normalized_data.
- Agent updates the correct row and logs AgentEvent.

**Files**

- `/backend/src/agents/SupplierNormalizationAgent.ts`

**Tests**

- Harness test that runs the agent on a fake SupplierPart record and asserts normalized_data exists and is structured.

---

#### 4.1.2 — Product Data Agent

- [ ] 🔴 **P0-CRITICAL** — Implement ProductDataAgent

**Description**  
Match normalized SupplierParts to canonical Parts and create new canonical Parts when no good match exists.

**Implementation Notes for Codex**

1. Create `/backend/src/agents/ProductDataAgent.ts` with `runTask`.
2. Steps:
   - Load `supplier_parts.normalized_data`.
   - Convert relevant attributes into a feature representation (name, category, brand, attributes).
   - If vector memory is not yet available, use simple text similarity or deterministic rules for MVP.
   - Try to find an existing Part with:
     - Same category and close brand/attributes.
   - If match found:
     - Set `canonical_part_id` on SupplierPart.
     - Optionally update canonical `attributes` if missing.
   - If no match:
     - Create a new Part row and link SupplierPart to it.
3. Log decisions in AgentEvents.

**Acceptance Criteria**

- SupplierParts are linked to canonical Parts (existing or new).
- No duplicate Parts created for very obvious identical supplier entries in simple test scenarios.

**Files**

- `/backend/src/agents/ProductDataAgent.ts`

**Tests**

- Scenario with multiple supplier records for what should be the same Part; ensure the agent converges them to a shared canonical Part.

---

#### 4.1.3 — Fitment Agent (MVP)

- [ ] 🔴 **P0-CRITICAL** — Implement FitmentAgent core

**Description**  
Implement the initial fitment logic to map canonical Parts to Vehicles with a confidence score and evidence.

**Implementation Notes for Codex**

1. Create `/backend/src/agents/FitmentAgent.ts` with `runTask`.
2. Inputs:
   - `canonical_part_id`
   - Candidate Vehicles (for MVP, you can pass a filtered subset or test data).
3. Responsibilities:
   - Use attributes (e.g. brake position, rotor size, engine) to determine potential matches.
   - Use LLM Router with `fitment_analysis` to:
     - Evaluate ambiguous or incomplete fits.
     - Generate human-readable reasoning.
   - Write `fitments` rows with confidence and evidence (JSON).
4. Confidence thresholds:
   - ≥ 0.90: “Guaranteed Fit”
   - 0.75–0.89: “Likely Fit”
   - < 0.75: uncertain; may still write a row but flagged for review.

**Acceptance Criteria**

- FitmentAgent creates `fitments` rows with valid `vehicle_id`, `canonical_part_id`, `confidence`, `evidence`.
- Evidence JSON clearly indicates why it fits (or partially fits).

**Files**

- `/backend/src/agents/FitmentAgent.ts`

**Tests**

- Harness tests using a small in-memory dataset representing known fitment cases (from EVALUATION_FRAMEWORK examples).

---

#### 4.1.4 — Pricing Agent (MVP)

- [ ] 🟡 **P1-HIGH** — Implement PricingAgent

**Description**  
Implement initial PricingAgent logic that computes final prices using supplier costs and simple margin rules.

**Implementation Notes for Codex**

1. Create `/backend/src/agents/PricingAgent.ts`.
2. Inputs:
   - `canonical_part_id`
   - SupplierPart cost data
3. Steps:
   - Choose “best” supplier (for MVP: cheapest cost).
   - Apply margin rules: e.g. `price = cost * (1 + margin)` with a configurable margin (e.g. 40%).
   - Enforce min margin threshold and optional max markup threshold.
   - Store pricing in a dedicated table or as part of `parts` metadata (depending on design).
4. Use TaskType `pricing_reasoning` when asking LLM for explanation or advanced decisions (optional for MVP).
5. Log an AgentEvent describing which supplier and margin were chosen.

**Acceptance Criteria**

- Final price is never below cost + minimum margin.
- PricingAgent can be invoked for a set of Parts and produce consistent results.

**Files**

- `/backend/src/agents/PricingAgent.ts`

**Tests**

- Scenario tests: different supplier cost combos, ensure price and margin rules hold.

---

#### 4.1.5 — SEO/Content Agent (MVP)

- [ ] 🟡 **P1-HIGH** — Implement SEOAgent

**Description**  
Generate product descriptions in line with `BRAND_GUIDE.md` and `VOICE_TONE_GUIDE.md`.

**Implementation Notes for Codex**

1. Create `/backend/src/agents/SEOAgent.ts`.
2. For each Part:
   - Collect attributes, category, and fitment summary.
   - Use LLM Router with TaskType `seo_generation`.
   - Prompt must:
     - Include explicit instructions to avoid unverified OEM claims or lifetime guarantees.
     - Follow AutoMechanica voice.
3. Restrict output:
   - Limit length to a reasonable number of tokens.
   - Output should be plain text with optional short sections (e.g. “Features”, “Fitment”).
4. Save description into `parts.description`.

**Acceptance Criteria**

- Generated descriptions are present and free from obviously forbidden claims.
- Descriptions mention key attributes and vehicle applicability where appropriate.

**Files**

- `/backend/src/agents/SEOAgent.ts`

**Tests**

- Simple tests to ensure generated descriptions:
  - Contain certain keywords when attributes are present.
  - Do not contain forbidden phrases (regex-based checks).

---

### 4.2 — Key Workflows

#### 4.2.1 — `wf_ingest_supplier_catalog`

- [ ] 🔴 **P0-CRITICAL** — Implement supplier ingestion workflow

**Description**  
Orchestrate End-to-End ingestion from raw supplier feed → normalized → canonical parts → fitment → pricing → SEO content.

**Implementation Notes for Codex**

1. Implement `/backend/src/workflows/wf_ingest_supplier_catalog.ts`.
2. Workflow steps could be:

   1. Load or receive supplier feed ID or file reference.
   2. For each raw item:
      - Create `supplier_parts` record with `raw_data`.
      - Enqueue a `normalize_supplier_part` task.
   3. Once normalization tasks complete (MVP can be naive, not waiting strictly):
      - Enqueue `match_canonical_part` tasks for ProductDataAgent.
   4. After parts are mapped:
      - Enqueue `generate_fitment` tasks for FitmentAgent.
      - Enqueue `calculate_pricing` tasks for PricingAgent.
      - Enqueue `generate_seo_content` tasks for SEOAgent.
3. Orchestrator:
   - Tracks state in `workflows.context`.
   - Marks workflow as completed when all tasks for this ingestion batch are done (MVP: basic counter or status check).

**Acceptance Criteria**

- Given a small mock “supplier feed”, running this workflow results in:
  - `supplier_parts` rows with normalized data.
  - `parts` rows created or updated.
  - `fitments` rows generated.
  - `parts.description` filled for at least some Parts.
- Workflow ends in `state = completed`.

**Files**

- `/backend/src/workflows/wf_ingest_supplier_catalog.ts`

**Tests**

- A workflow simulation test that:
  - Seeds a minimal supplier feed.
  - Runs the workflow.
  - Asserts that the expected number of Parts, Fitments, and descriptions are produced.

---

#### 4.2.2 — `wf_publish_new_part`

- [ ] 🟡 **P1-HIGH** — Implement part publication workflow

**Description**  
Finalize a new canonical Part by running Fitment, Pricing, and SEO as a cohesive workflow.

**Implementation Notes for Codex**

1. Implement `/backend/src/workflows/wf_publish_new_part.ts`.
2. Flow:
   - Input: `canonical_part_id`.
   - Enqueue tasks:
     - FitmentAgent (`generate_fitment`)
     - PricingAgent (`calculate_pricing`)
     - SEOAgent (`generate_seo_content`)
   - Monitor results:
     - When all three tasks succeed, mark Part as “ready_to_publish” (flag in DB).
3. Orchestrator uses the workflow registry to define this pipeline.

**Acceptance Criteria**

- Running `wf_publish_new_part` for a sample Part results in:
  - Fitments created or updated.
  - Pricing set.
  - Description generated.
  - Part flagged as ready.

**Files**

- `/backend/src/workflows/wf_publish_new_part.ts`

**Tests**

- Workflow test that ensures all three agents are invoked and final state is correct.

---

## PHASE 5 — Frontend UX (MVP) & Support Agent Integration

**Goal:** Implement the main customer-facing flows and basic AI Support integration.

---

### 5.1 — Vehicle Picker & Garage

#### 5.1.1 — VehiclePicker + GarageDropdown components

- [ ] 🔴 **P0-CRITICAL** — Implement core vehicle selection UX

**Description**  
Allow users to choose and manage their active vehicle, which drives all browsing and fitment contexts.

**Implementation Notes for Codex**

1. Implement `VehiclePicker.tsx`:
   - A UI component that lets users select Year, Make, Model, Trim, Engine via dropdowns or selects.
   - Integrate with backend `/vehicles` endpoints or a separate vehicle metadata source (MVP can use a static or stubbed list).
2. Implement `GarageDropdown.tsx`:
   - Displays:
     - Currently active vehicle
     - Option to switch to another saved vehicle
     - Option to “Add vehicle”
   - Should appear in header per `FRONTEND_UX_SPEC.md`.
3. Persistence:
   - For MVP, store active vehicle in localStorage.
   - Optionally sync with backend (e.g. `/api/v1/user/garage`) in future phases.
4. Handle empty state:
   - If no vehicle selected, header should encourage user to “Select your vehicle”.

**Acceptance Criteria**

- User can select a vehicle and see it reflected in header.
- Selected vehicle persists across page reloads (localStorage).
- Components match style guidelines in `BRAND_GUIDE.md`.

**Files**

- `/frontend/src/components/VehiclePicker.tsx`
- `/frontend/src/components/GarageDropdown.tsx`
- Supporting hooks/utilities

**Tests**

- Component tests verifying:
  - Vehicle can be selected.
  - Active vehicle label updates correctly.

---

### 5.2 — Product List & Detail Pages

#### 5.2.1 — Vehicle-aware category page

- [ ] 🔴 **P0-CRITICAL** — Implement vehicle-aware category browse

**Description**  
Allow users to browse parts categories, filtered for their active vehicle when available.

**Implementation Notes for Codex**

1. Implement a route:
   - `/vehicles/[year]/[make]/[model]/[category]` or equivalent.
2. On page load:
   - Read active vehicle (from context/localStorage).
   - If active vehicle matches URL, call backend:
     - `GET /parts` with filters including `vehicleId`.
   - If no active vehicle:
     - Show a message: “Select your vehicle to see only parts that fit.”
     - Optionally show a generic list of parts.
3. Use `ProductCard.tsx` to display:
   - Part name
   - Price
   - Fitment badge for the active vehicle (if available).
4. Consider pagination and basic filters (position, brand, etc.) as described in `FRONTEND_UX_SPEC.md`.

**Acceptance Criteria**

- If active vehicle is set:
  - Category page shows only parts with fitments for that vehicle.
- If no active vehicle:
  - Category page clearly prompts user to select a vehicle.
- Basic filters (e.g. position) work.

**Files**

- `/frontend/src/pages/...` (depending on framework)
- `/frontend/src/components/ProductCard.tsx`

**Tests**

- Rendering tests with mock API responses for:
  - With active vehicle.
  - Without active vehicle.

---

#### 5.2.2 — ProductDetail with FitmentBadge & reverse fitment table

- [ ] 🔴 **P0-CRITICAL** — Implement product detail UX

**Description**  
Show complete part details, fitment confidence for active vehicle, and full “Fits these vehicles” reverse fitment list.

**Implementation Notes for Codex**

1. Implement product detail route:
   - `/parts/[partId]`.
2. On load, call:
   - `GET /parts/:id` from `API_REFERENCE.md`.
3. UI sections:
   - Title, Price, Add-to-cart button.
   - **FitmentBadge**:
     - Must map confidence thresholds to badges:
       - Guaranteed Fit / Likely Fit / Verify Fitment.
   - SpecsTable: use `parts.attributes`.
   - ReverseFitmentTable: list of vehicles that part fits, with confidence column.
   - Description: SEO text from `parts.description`.
4. When active vehicle is available:
   - Highlight that row in reverse fitment table.
   - FitmentBadge should reflect the confidence for that specific vehicle.

**Acceptance Criteria**

- Product detail page displays:
  - Fitment badge
  - Specs table
  - Fits these vehicles table
  - Description
- Active vehicle row is visually indicated.

**Files**

- `/frontend/src/pages/parts/[partId].tsx`
- `/frontend/src/components/FitmentBadge.tsx`
- `/frontend/src/components/ReverseFitmentTable.tsx`
- `/frontend/src/components/SpecsTable.tsx`

**Tests**

- Unit tests ensuring correct badge rendering for various confidence values.

---

### 5.3 — Support Agent Integration

#### 5.3.1 — SupportChatEntry and backend `/support/message` wiring

- [ ] 🟡 **P1-HIGH** — Implement basic support chat entry point

**Description**  
Integrate the Support Agent as a simple chat-style interaction from product and checkout pages.

**Implementation Notes for Codex**

1. Backend:
   - Implement `POST /support/message` endpoint per `API_REFERENCE.md`.
   - Endpoint:
     - Validates input (`message`, optional `vehicleId`, `partId`).
     - Calls SupportAgent via LLM Router with TaskType `support_reply`.
     - Attaches vehicle + part context if available.
     - Returns reply and confidence.
2. Frontend:
   - Create `SupportChatEntry.tsx` component:
     - Triggered from “Ask AutoMechanica Support” button.
     - Shows a pop-up panel/modal with conversation log.
     - Sends messages to `/support/message`.
   - Pre-fill initial message context (e.g. show which part & vehicle are being discussed).
3. SupportAgent logic must follow `SUPPORT_POLICY.md` & `VOICE_TONE_GUIDE.md`.

**Acceptance Criteria**

- From a product page and/or cart/checkout:
  - User can click the support button.
  - A chat window appears.
  - Messages are sent and responses displayed.
- Backend receives and uses context fields when available.

**Files**

- `/backend/src/api/support.ts` (or similar handler)
- `/backend/src/agents/SupportAgent.ts`
- `/frontend/src/components/SupportChatEntry.tsx`

**Tests**

- Backend unit test for `/support/message` with mocked SupportAgent.
- Basic frontend test verifying chat UI sends requests.

---

## PHASE 6 — Evaluation, Admin Tools, and Polishing

**Goal:** Add evaluation harnesses, admin APIs, and CI to keep quality high over time.

---

### 6.1 — Evaluation Harnesses

#### 6.1.1 — Fitment gold dataset harness

- [ ] 🟡 **P1-HIGH** — Implement fitment evaluation harness

**Description**  
Create a test harness that uses a small gold dataset to evaluate FitmentAgent accuracy.

**Implementation Notes for Codex**

1. Store dataset under:
   - `/backend/tests/fixtures/fitment_gold.json`
2. Format entries as in `EVALUATION_FRAMEWORK.md` (vehicle, part, expected_fit).
3. Harness test:
   - For each scenario:
     - Run FitmentAgent for the given part/vehicle.
     - Compare predicted fit/does-not-fit vs expected.
   - Aggregate metrics:
     - Accuracy
     - False positives
     - False negatives.
4. Print or log summary at the end of the test.

**Acceptance Criteria**

- `npm test` can run the fitment harness test without manual intervention.
- Metrics are visible in logs or test output.

**Files**

- `/backend/tests/fitmentGoldHarness.test.ts`
- `/backend/tests/fixtures/fitment_gold.json`

**Tests**

- This task itself is a test harness; ensure it runs cleanly.

---

### 6.2 — Admin API & Basic UI (Queue/Workflows)

#### 6.2.1 — Admin endpoints for workflows & tasks

- [ ] 🟢 **P2-MEDIUM** — Implement admin monitoring API

**Description**  
Provide admin-only APIs to inspect workflows and tasks as defined in `API_REFERENCE.md`.

**Implementation Notes for Codex**

1. Implement routes:
   - `GET /admin/workflows`
   - `GET /admin/workflows/:id`
   - `POST /admin/workflows/:id/retry`
   - `GET /admin/tasks`
   - `POST /admin/tasks/:id/requeue`
2. Add simple admin guard:
   - For MVP, this can be a simple shared secret in headers or an environment gate.
3. These endpoints should:
   - Query DB for workflows and tasks.
   - Return structured summaries (IDs, states, error info).
   - Allow requeue of `dead` tasks safely.

**Acceptance Criteria**

- Admin endpoints respond with correct data.
- Requeue logic moves tasks from `dead` to `pending` with reset attempts.

**Files**

- `/backend/src/api/admin/workflows.ts`
- `/backend/src/api/admin/tasks.ts`

**Tests**

- API tests covering:
  - Listing workflows.
  - Listing tasks.
  - Requeue operations.

---

### 6.3 — Deployment & CI

#### 6.3.1 — Basic CI pipeline

- [ ] 🟡 **P1-HIGH** — Setup CI for tests and lint

**Description**  
Add CI configuration so that pushes/PRs automatically run tests and lint for backend and frontend.

**Implementation Notes for Codex**

1. Use GitHub Actions or similar.
2. CI workflow should:
   - Install dependencies.
   - Run backend tests.
   - Run frontend tests.
   - Run lint for both.
3. Fail the build if any of these fail.

**Acceptance Criteria**

- CI status appears for PRs.
- Broken tests/lint cause CI to fail.

**Files**

- `.github/workflows/ci.yml` (or equivalent for chosen CI)

**Tests**

- None beyond confirming CI runs successfully once configured.

---

## PHASE 7 — NICE-TO-HAVE IMPROVEMENTS (OPTIONAL)

These tasks can be done after a working MVP exists.

---

### 7.1 — Vector Memory Optimization

#### 7.1.1 — Qdrant adapter (future)

- [ ] 🔵 **P3-LOW** — Prepare Qdrant memory adapter

**Description**  
Add an abstraction layer over vector memory to allow swapping pgvector with Qdrant for high-scale search.

**Implementation Notes for Codex**

1. Refactor memory module to use:
   - `MemoryBackend` interface.
2. Implement:
   - `PgvectorMemoryBackend`
   - `QdrantMemoryBackend` (optional, behind feature flag)
3. Provide config to select backend at runtime.

**Acceptance Criteria**

- Code can compile with Qdrant backend available (even if not enabled by default).
- Memory queries can be routed through abstraction.

---

### 7.2 — Analytics Dashboards

#### 7.2.1 — Basic analytics endpoints

- [ ] 🔵 **P3-LOW** — Add metrics endpoints

**Description**  
Add endpoints to expose aggregated metrics for admin dashboards (queue depth, error rates, fitment accuracy).

**Implementation Notes**

- This can be a separate `GET /admin/metrics` endpoint that pulls from existing tables (`evaluation_metrics`, `tasks`, `agent_events`).

---

## 8. Definition of Done (DoD) for MVP

MVP is considered **DONE** when:

- All **P0** tasks in Phases 1–5 are completed.
- The following user flow is possible end-to-end:
  1. A small supplier catalog is ingested via `wf_ingest_supplier_catalog` and results in:
     - Canonical parts
     - Fitments
     - Pricing
     - Descriptions
  2. A frontend user can:
     - Select a vehicle.
     - Browse categories.
     - See only parts that fit their vehicle.
     - Open a product detail page and see:
       - Fitment badge
       - Specs
       - Fits-these-vehicles list
       - Description
     - Add a part to cart and place a simple order (MVP-level).
     - Open Support chat for a part and receive a context-aware response.
- Fitment evaluation harness runs and prints basic metrics.

At that point, AutoMechanica is a functioning, end-to-end, AI-assisted car parts platform.

---

# End of PROJECT_TODO.md
