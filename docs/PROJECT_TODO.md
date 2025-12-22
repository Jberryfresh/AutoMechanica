# PROJECT_TODO.md

# AutoMechanica — Project Execution TODO (Comprehensive Implementation Guide)

**Version**: 2.0 (Detailed Rewrite)  
**Last Updated**: 2024-11-27  
**Document Purpose**: This is the **master execution plan** for building AutoMechanica from first commit to production-ready MVP.

---

## 🎯 Executive Summary

This file is the **single source of truth** for what to build, in what order, and how to validate completion. It is designed for AI agents to execute autonomously with minimal ambiguity.

**What This Document Provides:**
- ✅ **Sequenced Implementation Plan**: 8 phases from repo setup to production deployment
- ✅ **Detailed Task Breakdowns**: Every task includes implementation notes, code examples, and acceptance criteria
- ✅ **Priority System**: P0-P3 priorities with clear rationales
- ✅ **Testing Strategy**: Specific test requirements for each task
- ✅ **Progress Tracking**: Checkbox system with metadata for CI/CD integration
- ✅ **Dependency Management**: Clear sequencing to avoid blockers

**Expected Timeline:**
- **Phases 1-2** (Foundation): 1-2 weeks
- **Phases 3-4** (Core Logic): 3-4 weeks  
- **Phase 5** (Frontend): 2-3 weeks
- **Phases 6-7** (Polish): 1-2 weeks
- **Phase 8** (Production): 1 week
- **Total**: 8-12 weeks for solo developer or AI agent

---

## 0. How to Use This File (CRITICAL: READ FIRST)

### 0.1 Execution Principles

**For AI Agents:**
1. **Sequential Execution**: Work through phases in order: Phase 1 → 2 → 3 → ... → 8
2. **Within-Phase Flexibility**: Tasks within a phase can sometimes be parallelized if no dependencies exist
3. **Checkpoint After Each Task**: Update checkbox status and metadata immediately after completion
4. **Documentation-First**: Always read referenced docs before implementing
5. **Test-Driven**: Write tests as specified in each task; all tests must pass before marking task complete
6. **Quality Gates**: Never skip acceptance criteria validation
7. **Branch Strategy**: Create feature branches per task group (e.g., `feature/phase1-repo-structure`)

**Work Mode Decision Tree:**
```
Is this task P0-CRITICAL?
  ├─ YES → Must complete before any P1 tasks in same phase
  └─ NO → Can be done in parallel with other non-P0 tasks IF no dependencies

Does this task have explicit dependencies listed?
  ├─ YES → Complete all dependencies first
  └─ NO → Can start immediately if phase prerequisites met

Are all acceptance criteria met?
  ├─ YES → Mark task [✓], update metadata, commit
  └─ NO → Continue implementation or request clarification
```

### 0.2 Status Legend & Workflow

**Checkbox States:**
- `[ ]` = **Not Started** — Task not yet begun
- `[🔲]` = **In Progress** — Currently being worked on (only 1-2 tasks should have this status)
- `[✓]` = **Done** — All acceptance criteria met, tests passing, code reviewed and merged
- `[⚠️]` = **Blocked** — Cannot proceed due to external dependency or issue (add note in metadata)
- `[⏭️]` = **Skipped** — Intentionally deferred or no longer needed (document reason)

**Workflow Per Task:**
1. Set status to `[🔲]` and update `metadata.StartedBy` with your name/agent ID
2. Read all referenced documentation
3. Implement solution per implementation notes
4. Write tests as specified
5. Validate all acceptance criteria
6. Run linter and type checker
7. Commit to feature branch
8. Set status to `[✓]` and update `metadata.CompletedBy`, `metadata.CompletedAt`, `metadata.Commit`
9. Open PR if ready to merge
10. Update `metadata.PR` with PR number

### 0.3 Priority System (P0-P3)

**🔴 P0-CRITICAL** — System Cannot Function Without This
- Blocks other tasks or entire phases
- Required for MVP launch
- Examples: Database setup, API foundation, core workflows
- **Rule**: Complete ALL P0 tasks in a phase before moving to next phase

**🟡 P1-HIGH** — Significant User-Facing Feature or Core Logic
- Important for good UX or system reliability
- Should be completed for MVP but not absolutely blocking
- Examples: Frontend components, agent logic, evaluation harness
- **Rule**: Complete 80%+ of P1 tasks before considering phase "done"

**🟢 P2-MEDIUM** — Nice-to-Have or Internal Tooling
- Improves developer experience or adds polish
- Can be deferred to post-MVP if time constrained
- Examples: Admin dashboards, advanced error handling, optimization
- **Rule**: Optional for MVP, prioritize based on available time

**🔵 P3-LOW** — Future Enhancement or Optimization
- Not needed for MVP at all
- Good candidates for post-launch iterations
- Examples: Qdrant migration, analytics dashboards, advanced features
- **Rule**: Defer to Phase 8 (Post-MVP) or later sprints

### 0.4 Documentation References (MUST READ)

**Before starting ANY task, familiarize yourself with these documents:**

**Foundation Documents** (Read First):
- 📘 `/docs/MAIN_PLAN.md` — Complete system vision, architecture, and success criteria
- 📘 `/docs/ARCHITECTURE_OVERVIEW.md` — Technical architecture deep-dive
- 📘 `/docs/DOMAIN_MODEL.md` — Complete database schema and entity relationships
- 📘 `/docs/CODE_STYLE_AND_CONVENTIONS.md` — Coding standards and patterns

**Subsystem Specifications** (Read When Implementing Related Tasks):
- 📗 `/docs/AGENTS_AND_WORKFLOWS.md` — Agent behavior specs and workflow definitions
- 📗 `/docs/LLM_ROUTER_SPEC.md` — LLM provider routing and cost management
- 📗 `/docs/TASK_QUEUE_SPEC.md` — Task queue implementation details
- 📗 `/docs/VECTOR_MEMORY_DESIGN.md` — Vector memory and semantic search
- 📗 `/docs/EVALUATION_FRAMEWORK.md` — Quality metrics and testing harnesses

**UX & Content Guidelines** (Read for Frontend Tasks):
- 📙 `/docs/FRONTEND_UX_SPEC.md` — Complete UI/UX specifications
- 📙 `/docs/BRAND_GUIDE.md` — Visual design system and brand assets
- 📙 `/docs/VOICE_TONE_GUIDE.md` — Content tone and messaging guidelines
- 📙 `/docs/SUPPORT_POLICY.md` — Support agent safety policies

**Operational Documents** (Read for Deployment Tasks):
- 📕 `/docs/ENV_SETUP_GUIDE.md` — Environment configuration
- 📕 `/docs/INSTALLATION.md` — Setup instructions for developers
- 📕 `/docs/DEPLOYMENT.md` — Production deployment procedures
- 📕 `/docs/API_REFERENCE.md` — Complete API endpoint documentation

**Critical Rules:**
1. **Never contradict the docs**: If this TODO conflicts with a spec document, the spec document wins
2. **When in doubt**: Reference MAIN_PLAN.md for high-level guidance
3. **For schema questions**: DOMAIN_MODEL.md is the source of truth
4. **For UX questions**: FRONTEND_UX_SPEC.md and BRAND_GUIDE.md govern all decisions

### 0.5 Task Template & Metadata

Each task follows this structure:

```markdown
#### X.Y.Z — Task Title

- [ ] 🔴 **P0-CRITICAL** — One-sentence description

**Description**  
Detailed explanation of what needs to be built and why it matters.

**Implementation Notes for AI Agents**
Step-by-step instructions with:
- Specific file paths to create
- Code examples or pseudocode
- Technology/library recommendations
- Edge cases to handle
- Integration points with other subsystems

**Acceptance Criteria**
Checklist of requirements that MUST be met:
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2 (testable, specific)
- [ ] All tests pass
- [ ] Documentation updated

**Files Created/Modified**
- `/path/to/file1.ts` (created)
- `/path/to/file2.ts` (modified)

**Tests Required**
- Test scenario 1
- Test scenario 2
- Integration test

**Dependencies**
- Task X.Y.Z must be complete first (if any)

**Estimated Effort**
- Small (< 4 hours) | Medium (4-8 hours) | Large (8-16 hours) | XL (16+ hours)

**Metadata** (Update as you progress)
- Branch: `feature/phase-X-description`
- StartedBy: [Agent/Dev Name]
- StartedAt: [YYYY-MM-DD HH:MM]
- CompletedBy: [Agent/Dev Name]
- CompletedAt: [YYYY-MM-DD HH:MM]
- PR: #[number]
- Commit: [short SHA]
- TestsPassing: [YES/NO]
- Notes: [Any important context or decisions]
```

### 0.6 Quality Gates & Definition of Done

**Task-Level Definition of Done:**
- [x] All implementation notes followed
- [x] All acceptance criteria validated
- [x] All specified tests written and passing
- [x] Code follows CODE_STYLE_AND_CONVENTIONS.md
- [x] TypeScript compiles without errors
- [x] ESLint passes with zero warnings
- [x] No `any` types unless explicitly justified in comments
- [x] All functions have JSDoc comments
- [x] Related documentation updated
- [x] Code committed to feature branch
- [x] Metadata section complete

**Phase-Level Definition of Done:**
- [x] All P0-CRITICAL tasks ✓
- [x] 80%+ of P1-HIGH tasks ✓
- [x] Phase integration test passes (if specified)
- [x] All phase tests passing in CI
- [x] Phase completion reviewed (self-check or PR review)
- [x] Relevant docs updated to reflect what was built

**MVP-Level Definition of Done:**
- [x] All P0 tasks in Phases 1-7 complete
- [x] End-to-end user flow functional (see Phase 8)
- [x] All evaluation harnesses running
- [x] Performance targets met (see MAIN_PLAN.md Section 7.4)
- [x] Security requirements met (HTTPS, no SQL injection, XSS prevention)
- [x] Deployed to staging environment
- [x] Smoke tests pass on staging
- [x] Ready for beta launch

### 0.7 Emergency Protocols

**If You Get Stuck:**
1. Re-read the relevant spec document (listed in task dependencies)
2. Check if there's a similar implementation elsewhere in the codebase
3. Review test requirements — they often clarify expected behavior
4. Check if task is blocked by incomplete dependency (mark `[⚠️]`)
5. Document the blocker in metadata.Notes and move to next non-blocked task

**If Tests Fail:**
1. Read error messages carefully — they often point to the exact issue
2. Check acceptance criteria — did you miss a requirement?
3. Verify environment setup (database running? env vars set?)
4. Run tests in isolation to rule out interference
5. Check that all dependencies are installed (`npm install`)

**If Specs Contradict:**
1. MAIN_PLAN.md > subsystem specs > this TODO
2. DOMAIN_MODEL.md is always correct for schema questions
3. When truly ambiguous, choose the simpler implementation and document decision
4. Add a `// TODO:` comment flagging the ambiguity for future resolution

---

---

## Phase 1: Repository Structure & Environment Setup

**Phase Objective**: Create a bulletproof foundation that supports rapid, error-free development from day 1.

**Phase Success Criteria:**
- ✅ Any developer (or AI agent) can clone repo and be running in < 10 minutes
- ✅ TypeScript compiles without errors or warnings
- ✅ ESLint and Prettier configured and passing
- ✅ Git hooks prevent bad commits (linting, type checking)
- ✅ Environment variables properly templated and documented
- ✅ CI pipeline runs on every commit (linting + type check at minimum)
- ✅ Monorepo structure established with shared types

**Dependencies**: None (this is the absolute starting point)

**Critical Context for AI Agents:**
This phase sets the tone for code quality throughout the project. A well-structured Phase 1 prevents:
- Linting wars and inconsistent code style
- TypeScript configuration headaches
- Missing environment variables in production
- Slow onboarding for new contributors
- Integration test failures due to environment mismatches

**Architecture Decision: Monorepo Structure**

**Recommended Structure**:
```
AutoMechanica/
├── packages/
│   ├── backend/          # Node.js API server
│   ├── frontend/         # React SPA
│   ├── shared/           # Shared TypeScript types/utils
│   └── scripts/          # Build and deployment scripts
├── package.json          # Root workspace configuration
├── tsconfig.json         # Base TypeScript config
├── docs/                 # All specification documents
└── .github/
     └── workflows/       # CI/CD pipelines
```

**Technology Stack Confirmed:**
- **Language**: TypeScript 5.x (strict mode)
- **Backend**: Node.js 20.x LTS + Express
- **Frontend**: React 18.x + Vite + Tailwind CSS 3.x
- **Database**: PostgreSQL 15+ with pgvector extension
- **Package Manager**: npm workspaces
- **Testing**: Vitest (backend + frontend) + Playwright (E2E)
- **Linting**: ESLint 8.x + Prettier 3.x
- **Type Checking**: TypeScript strict mode

**When This Phase Is Done:**
- ✅ Repository cloneable and buildable by any developer
- ✅ `npm install` completes and workspace dev servers start
- ✅ `npm run lint --workspaces` passes with zero warnings
- ✅ `npm run typecheck --workspaces` passes with zero errors
- ✅ `npm run test --workspaces` runs successfully
- ✅ Git pre-commit hooks work correctly
- ✅ CI pipeline runs successfully on GitHub Actions
- ✅ `.env.example` documents all required environment variables
- ✅ README.md has clear 5-minute quick start guide

---

### 1.1 — Repository & Docs Scaffolding

#### 1.1.1 — Create base repo structure

- [✓] 🔴 **P0-CRITICAL** — Initialize repo & core folders

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

- [✓] 🔴 **P0-CRITICAL** — Copy spec documents into repo

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

#### 1.2.1 — Backend TypeScript Configuration & Tooling

- [✓] 🔴 **P0-CRITICAL** — Setup complete backend TypeScript project with linting and testing

**Description**

Establish a production-ready backend TypeScript configuration with strict type checking, ESLint, Prettier, and testing infrastructure. This ensures code quality from day one and prevents technical debt accumulation.

**Why This Matters:**
- **Type Safety**: Strict TypeScript catches bugs at compile time before deployment
- **Code Quality**: ESLint + Prettier enforce consistent style across the team
- **Maintainability**: Proper tooling makes the codebase sustainable long-term
- **Developer Experience**: Fast feedback loops with watch mode and hot reload

**Implementation Notes for AI Agents**

**Step 1: Configure TypeScript for Backend**

1. Create `/packages/backend/tsconfig.json` with production-ready settings:
   - Choose appropriate ES target and module system for Node.js backend
   - Enable **strict mode** with all type safety flags (catch bugs at compile time)
   - Configure path aliases for clean imports (avoid `../../../` patterns)
     - Create aliases for major directories: api, agents, database, utilities, queue, LLM, services
     - Use consistent naming convention (e.g., `@/` prefix or similar)
   - Set up proper input/output directories for source and compiled files
   - Enable source maps and declaration files for debugging and type exports
   - Configure include/exclude patterns to process only source files (exclude tests, build output, node_modules)

**Step 2: Configure ESLint for TypeScript**

1. Create `/packages/backend/.eslintrc.json`:
   - Use TypeScript parser with project reference for type-aware linting
   - Extend recommended TypeScript and ESLint configurations
   - Configure code style rules (consistency is key - choose semicolons/no-semicolons, quotes, indentation)
   - Enable strict rules for:
     - Preventing `any` types (defeats purpose of TypeScript)
     - Catching unhandled promises (critical for async safety)
     - Enforcing proper async/await usage
   - Allow console logging in backend (needed for server logs)
   - Consider allowing unused variables that follow a naming convention (e.g., prefixed with `_`)
   - Set appropriate environment (Node.js, modern ES)

**Step 3: Configure Prettier**

1. Create `/packages/backend/.prettierrc.json`:
   - Choose consistent code formatting preferences (semicolons, quotes, line width, indentation)
   - Ensure settings align with ESLint configuration to avoid conflicts
   - Use standard conventions for the TypeScript ecosystem
   - Set line endings appropriate for cross-platform development

2. Create `/packages/backend/.prettierignore`:
   - Exclude build output directories
   - Exclude dependency directories
   - Exclude generated files and lock files

**Step 4: Configure Vitest for Testing**

1. Create `/packages/backend/vitest.config.ts`:
   - Set up Node.js test environment (backend doesn't need DOM)
   - Enable convenient global test utilities (describe, it, expect) or require explicit imports
   - Configure code coverage collection with appropriate provider
   - Set coverage reporters for different output formats (terminal, HTML report, CI integration)
   - Exclude non-source files from coverage (tests, build output, dependencies)
   - Mirror TypeScript path aliases for consistent imports in tests
   - Configure global setup file for test environment initialization

2. Create `/packages/backend/tests/setup.ts`:
   - Set up test environment variables (NODE_ENV=test, test port, etc.)
   - Add any global test fixtures or mock setup
   - Configure test lifecycle hooks (beforeAll, afterAll) for initialization and cleanup
   - Consider logging test environment details for debugging

3. Create sample test file (e.g., `/packages/backend/tests/unit/health.test.ts`):
   - Write basic smoke tests to verify test infrastructure works
   - Test simple assertions to confirm test framework configured correctly
   - Test environment variables are properly set
   - Keep initial tests simple and fast

**Step 5: Enhance Backend Entry Point**

Update `/packages/backend/src/index.ts` with production-ready structure:
1. Add documentation header explaining the server's purpose and linking to relevant architecture docs
2. Load environment variables early in the application lifecycle
3. Import Express and necessary middleware (choose appropriate security, CORS, compression, parsing middleware)
4. Define TypeScript types/interfaces for error handling that extend standard Error with HTTP status information
5. Set up environment-aware constants (port, environment, production flags)
6. Configure middleware in the **correct order** (security → CORS → body parsing → logging):
   - Security headers (consider production vs development needs)
   - CORS policy (allow frontend origin from environment)
   - Response compression for performance
   - Request body parsing with appropriate size limits
   - Request logging (timestamp, method, path)
7. Implement core endpoints:
   - Health check endpoint returning server status and metadata
   - API root endpoint documenting available routes
   - 404 handler for unknown routes (return JSON, not HTML)
   - Global error handler (log errors, return appropriate status, hide sensitive info in production)
8. Start server only in non-test environments (allow test imports without starting server)
9. Log clear startup information (environment, port, key endpoints)
10. Export app for testing and programmatic use

**Step 6: Update Backend package.json Scripts**

Add npm scripts for common development tasks in `/packages/backend/package.json`:
- **dev**: Start development server with watch mode (auto-restart on changes)
- **build**: Compile TypeScript to JavaScript for production
- **start**: Run the compiled production build
- **test**: Run tests (consider watch mode for development)
- **test:run**: Run tests once (for CI)
- **test:coverage**: Generate code coverage report
- **lint**: Check code for linting errors
- **lint:fix**: Automatically fix linting issues
- **format**: Format code with Prettier
- **format:check**: Check if code is formatted (for CI)
- **typecheck**: Run TypeScript compiler in check mode (no output, just validation)

**Acceptance Criteria**

- [ ] `/packages/backend/tsconfig.json` created with strict mode and path aliases
- [ ] `/packages/backend/.eslintrc.json` configured with TypeScript rules
- [ ] `/packages/backend/.prettierrc.json` and `.prettierignore` configured
- [ ] `/packages/backend/vitest.config.ts` created with Node environment
- [ ] `/packages/backend/tests/setup.ts` created for global test setup
- [ ] Sample test file `/packages/backend/tests/unit/health.test.ts` exists and passes
- [ ] `/packages/backend/src/index.ts` enhanced with production-ready structure
- [ ] `npm run dev --workspace @automechanica/backend` starts server on port 3001
- [ ] `npm run build --workspace @automechanica/backend` compiles without errors
- [ ] `npm run lint --workspace @automechanica/backend` passes with no errors
- [ ] `npm run test:run --workspace @automechanica/backend` runs successfully
- [ ] Health endpoint `http://localhost:3001/api/health` returns proper JSON
- [ ] Path aliases (`@/`, `@/api/*`, etc.) resolve correctly in imports
- [ ] TypeScript strict mode catches common errors (no implicit any, null checks, etc.)

**Files Created/Modified**

- `/packages/backend/tsconfig.json` (NEW)
- `/packages/backend/.eslintrc.json` (NEW)
- `/packages/backend/.prettierrc.json` (NEW)
- `/packages/backend/.prettierignore` (NEW)
- `/packages/backend/vitest.config.ts` (NEW)
- `/packages/backend/tests/setup.ts` (NEW)
- `/packages/backend/tests/unit/health.test.ts` (NEW)
- `/packages/backend/src/index.ts` (ENHANCED from Task 1.1.1)
- `/packages/backend/package.json` (UPDATE scripts)

**Tests Required**

- **Automated**: `npm run test:run --workspace @automechanica/backend` → All tests pass
- **Automated**: `npm run lint --workspace @automechanica/backend` → No errors
- **Automated**: `npm run typecheck --workspace @automechanica/backend` → No type errors
- **Automated**: `npm run build --workspace @automechanica/backend` → Compiles successfully
- **Manual**: Start dev server → `curl http://localhost:3001/api/health` returns valid JSON
- **Manual**: Make syntax error in src/index.ts → Verify ESLint catches it
- **Manual**: Add type error (e.g., assign number to string) → Verify TypeScript catches it

**Dependencies**

- **Blocks**: None (can work in parallel with other Phase 1 tasks)
- **Blocked By**: Task 1.1.1 (requires monorepo structure)

**Estimated Effort**

- **Medium** (4-6 hours including testing and verification)

**Metadata**

- Branch: `feature/phase1-backend-typescript`
- StartedBy:
- StartedAt:
- CompletedBy:
- CompletedAt:
- PR:
- Commit:
- TestsPassing:
- Notes:

---

#### 1.2.2 — Frontend TypeScript, Vite & Tailwind Configuration

- [✓] 🟡 **P1-HIGH** — Setup complete frontend project with React, Vite, Tailwind CSS

**Description**

Create a production-ready React frontend with Vite for fast development, Tailwind CSS for styling with AutoMechanica brand colors, and complete TypeScript configuration. This establishes the foundation for all UI development.

**Why This Matters:**
- **Development Speed**: Vite provides instant HMR (sub-second updates) and fast builds
- **Brand Consistency**: Tailwind config enforces design system from BRAND_GUIDE.md
- **Type Safety**: TypeScript in React prevents prop-type errors and component interface mismatches
- **Performance**: Vite automatically optimizes bundle size with code splitting

**Implementation Notes for AI Agents**

**Step 1: Configure TypeScript for React**

1. Create `/packages/frontend/tsconfig.json`:
   - Choose appropriate ES target and module system for modern browser environments
   - Enable necessary DOM libraries for browser APIs
   - Configure JSX transform (React 17+ modern transform or classic)
   - Set module resolution strategy compatible with Vite bundler
   - Enable strict type checking across the board
   - Configure for Vite's build process (disable emit since Vite handles bundling)
   - Set up path aliases for clean imports in React components
     - Create aliases for: components, pages, hooks, utilities, context, styles
     - Use consistent naming convention across the project

2. Create `/packages/frontend/tsconfig.node.json`:
   - Separate configuration for build tooling (Vite config runs in Node environment)
   - Enable project references for proper TypeScript compilation
   - Configure for bundler-style module resolution
   - Include only build configuration files

**Step 2: Configure Vite**

Create `/packages/frontend/vite.config.ts`:
1. Import and configure Vite with React plugin for JSX transformation and fast refresh
2. Configure path aliases to match TypeScript configuration (consistent imports)
3. Configure development server:
   - Choose appropriate port for frontend
   - Set up API proxy to backend (avoid CORS issues in development)
   - Enable CORS for backend requests
4. Configure production build:
   - Set output directory
   - Enable source maps for production debugging (balance security vs debuggability)
   - Optimize bundle splitting strategy:
     - Separate React and routing libraries (stable, cacheable vendor bundle)
     - Separate data fetching libraries (React Query or similar)
     - Separate UI utility libraries
     - Consider code-splitting for routes/pages

**Step 3: Configure Tailwind CSS with Brand Colors**

1. Create `/packages/frontend/tailwind.config.js`:
   - Configure content scanning for all HTML and component files
   - Extend theme with **AutoMechanica brand colors** from BRAND_GUIDE.md:
     - **Primary action color** (e.g., electric-teal): Create full shade palette (50-900) for versatility
     - **Heading/emphasis color** (e.g., deep-navy): Full shade palette for typography hierarchy
     - **Body text/secondary color** (e.g., gunmetal): Full shade palette for subtle variations
   - Configure typography:
     - Set sans-serif font stack (consider Inter, System UI, or similar modern font)
     - Set monospace font for code display
   - Extend spacing scale if needed for larger layouts
   - Extend border radius for brand-appropriate rounding
   - Consider adding brand-specific shadows, transitions, or other design tokens

2. Create `/packages/frontend/postcss.config.js`:
   - Configure PostCSS to process Tailwind directives
   - Add autoprefixer for cross-browser compatibility

**Step 4: Create Global Styles with Brand System**

Create `/packages/frontend/src/index.css`:
1. Import Tailwind layers (base, components, utilities)
2. Define base layer styles:
   - Set consistent border defaults
   - Configure body with brand colors and typography
   - Style heading hierarchy (h1-h6) with brand emphasis color and weights
   - Ensure text sizing scales appropriately
3. Define component layer with reusable UI patterns:
   - **Button styles**: Create base button class with variants (primary, secondary, etc.)
   - **Card styles**: Consistent container styling for content cards
   - **Input styles**: Form input styling with focus states using brand colors
   - **Other common patterns**: Consider creating utilities for badges, alerts, etc.
4. Keep styles semantic and composable (prefer utility classes over complex custom CSS)

**Step 5: Enhance Frontend Entry Point**

1. Update `/packages/frontend/src/main.tsx`:
   - Set up React root rendering with modern ReactDOM API
   - Import global styles
   - Configure React Query client (or similar data fetching library):
     - Set appropriate stale time for cached data
     - Configure retry behavior for failed requests
   - Set up routing provider (React Router or similar)
   - Wrap application in necessary providers (Query, Router, Context, etc.)
   - Enable React Strict Mode for development warnings
   - Create simple initial App component demonstrating:
     - Brand colors in use (headings, buttons)
     - Typography hierarchy
     - Basic layout structure
     - Call-to-action elements
   - Handle root element safely (error if missing)
   - Export for testing purposes

2. Update `/packages/frontend/index.html`:
   - Set appropriate page metadata (title, description for SEO)
   - Import chosen web fonts (preconnect for performance)
   - Ensure proper viewport configuration for responsive design
   - Link to module entry point for Vite

**Step 6: Configure ESLint for React**

Create `/packages/frontend/.eslintrc.json`:
1. Configure TypeScript parser with JSX support
2. Extend recommended configurations:
   - Standard ESLint recommendations
   - TypeScript-specific linting rules
   - React best practices and patterns
   - React Hooks rules (crucial for proper hook usage)
3. Adjust rules for React 17+ environment:
   - Modern JSX transform doesn't require React import in every file
   - TypeScript handles prop validation (can disable prop-types)
   - Maintain strict `any` prohibition
4. Configure React version detection (auto-detect from package.json)

**Step 7: Configure Vitest for React Testing**

1. Create `/packages/frontend/vitest.config.ts`:
   - Import and configure React plugin (required for JSX in tests)
   - Set test environment to jsdom (provides browser APIs like DOM, window, document)
   - Enable global test utilities or require explicit imports (your preference)
   - Configure test setup file for global test configuration
   - Mirror path aliases from TypeScript config for imports in tests

2. Create `/packages/frontend/tests/setup.ts`:
   - Import testing utilities (React Testing Library)
   - Configure automatic cleanup after each test (prevent memory leaks)
   - Import extended matchers for DOM testing (toBeInTheDocument, toHaveClass, etc.)
   - Add any global mocks or test utilities needed across test files

**Step 8: Update Frontend package.json Scripts**

Add npm scripts for common frontend development tasks:
- **dev**: Start Vite development server with hot module replacement
- **build**: Type check and build production bundle
- **preview**: Preview production build locally
- **test**: Run tests in watch mode
- **test:run**: Run tests once (for CI)
- **lint**: Check code for linting errors
- **lint:fix**: Automatically fix linting issues
- **format**: Format code with Prettier
- **typecheck**: Run TypeScript compiler in check mode

**Acceptance Criteria**

- [ ] TypeScript configuration with strict mode and path aliases
- [ ] Vite configuration with React plugin and API proxy
- [ ] Tailwind CSS configured with AutoMechanica brand colors (electric-teal, deep-navy, gunmetal)
- [ ] ESLint configured for React and TypeScript
- [ ] Vitest configured with jsdom environment
- [ ] `npm run dev --workspace @automechanica/frontend` starts Vite dev server on port 5173
- [ ] `npm run build --workspace @automechanica/frontend` compiles without errors
- [ ] `npm run lint --workspace @automechanica/frontend` passes with no errors
- [ ] Brand colors visible in UI (buttons use electric-teal-600, heading uses deep-navy-900)
- [ ] Hot module replacement works (edit component → instant UI update)
- [ ] Path aliases (`@/components`, etc.) resolve correctly
- [ ] API proxy works (requests to /api forward to backend)

**Files Created/Modified**

- `/packages/frontend/tsconfig.json` (NEW)
- `/packages/frontend/tsconfig.node.json` (NEW)
- `/packages/frontend/vite.config.ts` (NEW)
- `/packages/frontend/tailwind.config.js` (NEW)
- `/packages/frontend/postcss.config.js` (NEW)
- `/packages/frontend/src/index.css` (NEW)
- `/packages/frontend/src/main.tsx` (ENHANCED from Task 1.1.1)
- `/packages/frontend/index.html` (ENHANCED from Task 1.1.1)
- `/packages/frontend/.eslintrc.json` (NEW)
- `/packages/frontend/vitest.config.ts` (NEW)
- `/packages/frontend/tests/setup.ts` (NEW)
- `/packages/frontend/package.json` (UPDATE scripts)

**Tests Required**

- **Manual**: `npm run dev --workspace @automechanica/frontend` → Open http://localhost:5173 → Verify UI displays with correct brand colors
- **Manual**: Edit component in src/main.tsx → Verify HMR updates UI instantly
- **Manual**: Click buttons → Verify hover states work (color changes on hover)
- **Automated**: `npm run lint --workspace @automechanica/frontend` → No errors
- **Automated**: `npm run typecheck --workspace @automechanica/frontend` → No type errors
- **Automated**: `npm run build --workspace @automechanica/frontend` → Successful build
- **Manual**: Inspect Tailwind classes in browser DevTools → Verify brand colors applied correctly

**Dependencies**

- **Blocks**: None (can work in parallel)
- **Blocked By**: Task 1.1.1 (requires monorepo structure)

**Estimated Effort**

- **Medium** (4-6 hours including design system setup)

**Metadata**

- Branch: `feature/phase1-frontend-vite-tailwind`
- StartedBy:
- StartedAt:
- CompletedBy:
- CompletedAt:
- PR:
- Commit:
- TestsPassing:
- Notes:
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

- [✓] 🟡 **P1-HIGH** — Setup frontend project

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

#### 1.2.3 — Environment Variables & Configuration Management

- [✓] 🟡 **P1-HIGH** — Create comprehensive environment configuration with validation

**Description**

Establish a robust environment variable system with example files, validation logic, and documentation. This ensures developers can quickly set up the project and the application fails fast with clear errors when misconfigured.

**Why This Matters:**
- **Developer Onboarding**: New developers can copy `.env.example` and get started immediately
- **Security**: No secrets committed to git; clear separation of config from code
- **Fail Fast**: Application validates env vars on startup, preventing runtime errors
- **Documentation Sync**: ENV_SETUP_GUIDE.md stays aligned with actual requirements

**Implementation Notes for AI Agents**

**Step 1: Create Root Environment Example**

Create `/.env.example` at repository root:
1. Add database configuration:
   - `DATABASE_URL` → PostgreSQL connection string template
   - `POSTGRES_USER` → Default: automechanica
   - `POSTGRES_PASSWORD` → Default: dev_password_change_in_production
   - `POSTGRES_DB` → Default: automechanica

2. Add LLM provider API keys (leave blank for user to fill):
   - `OPENAI_API_KEY` → OpenAI API key
   - `ANTHROPIC_API_KEY` → Anthropic (Claude) API key
   - `GOOGLE_API_KEY` → Google (Gemini) API key (optional)

3. Add model configuration:
   - `EMBEDDING_MODEL` → Default: text-embedding-3-large
   - `DEFAULT_LLM_PROVIDER` → Default: openai
   - `DEFAULT_LLM_MODEL` → Default: gpt-4-turbo-preview

4. Add server configuration:
   - `PORT` → Default: 3001
   - `NODE_ENV` → Default: development
   - `FRONTEND_URL` → Default: http://localhost:5173
   - `BACKEND_URL` → Default: http://localhost:3001

5. Add task queue configuration:
   - `TASK_POLL_INTERVAL_MS` → Default: 5000
   - `MAX_CONCURRENT_TASKS` → Default: 5
   - `TASK_TIMEOUT_MS` → Default: 300000 (5 minutes)

6. Add vector search configuration:
   - `VECTOR_DIMENSIONS` → Default: 3072 (for text-embedding-3-large)
   - `VECTOR_SIMILARITY_THRESHOLD` → Default: 0.7

7. Add logging and monitoring:
   - `LOG_LEVEL` → Default: info (options: error, warn, info, debug)
   - `ENABLE_REQUEST_LOGGING` → Default: true

**Step 2: Create Backend-Specific Environment File**

Create `/packages/backend/.env.example` (if needed for backend-only vars):
- Inherit from root `.env.example`
- Add any backend-specific overrides or additional variables
- Document which variables are required vs optional

**Step 3: Create Environment Validation Module**

Create `/packages/backend/src/lib/env.ts`:
1. Define TypeScript interface representing all environment variables with proper types
2. Implement validation logic that:
   - Checks all REQUIRED variables exist (fail fast if missing critical config)
   - Validates formats (URLs, connection strings, numeric values)
   - Validates ranges and constraints (ports 1-65535, enum values, etc.)
   - Provides **clear, actionable error messages** (tell developer exactly what's wrong and how to fix it)
   - Returns typed configuration object (eliminates raw `process.env` access throughout code)
3. Export validated config for application-wide use
4. Call validation at application startup (before any other initialization)

**Step 4: Update Backend Entry Point for Environment Validation**

In `/packages/backend/src/index.ts`:
1. Import validation module at the very top
2. Call validation before any other initialization (fail fast on misconfiguration)
3. Use typed config object throughout application (no raw `process.env` access)
4. If validation fails, log clear error and exit gracefully with non-zero code

**Step 5: Add Environment Configuration to Frontend**

Create `/packages/frontend/.env.example`:
1. Add Vite-prefixed variables (Vite exposes only `VITE_*` variables to client code)
2. Include API URL, app configuration, feature flags
3. **Document clearly**: Vite variables are PUBLIC (bundled into client-side code)
4. **Security warning**: Never put secrets in `VITE_*` variables

Create `/packages/frontend/src/lib/config.ts`:
- Read from `import.meta.env.VITE_*` variables
- Export typed configuration object
- Provide sensible defaults for optional values
- Validate required configuration on app initialization

**Step 6: Update INSTALLATION.md**

Update `/docs/INSTALLATION.md`:
1. Add "Environment Setup" section near the top
2. List ALL required environment variables with descriptions
3. Provide step-by-step instructions:
   - Copy `.env.example` to `.env`
   - Fill in API keys (link to provider signup pages)
   - Explain database URL format
   - Note which variables have defaults and which MUST be set
4. Add troubleshooting section for common env-related errors

**Step 7: Update ENV_SETUP_GUIDE.md**

Update `/docs/ENV_SETUP_GUIDE.md`:
1. Add comprehensive documentation for EVERY environment variable:
   - Variable name
   - Description
   - Required vs Optional
   - Default value (if any)
   - Valid values/format
   - Example value
   - Impact on system behavior
2. Add section on environment variable precedence (.env file vs system env)
3. Add security best practices (never commit .env, rotate keys, etc.)
4. Add development vs production configuration differences

**Step 8: Update .gitignore**

Ensure `/.gitignore` includes:
- `.env` (actual environment file)
- `.env.local`
- `.env.*.local`
- But NOT `.env.example` (this should be committed)

**Acceptance Criteria**

- [ ] `/.env.example` exists with ALL required variables documented
- [ ] `/packages/backend/.env.example` exists (if backend-specific vars needed)
- [ ] `/packages/frontend/.env.example` exists with `VITE_` prefixed variables
- [ ] `/packages/backend/src/lib/env.ts` validates environment on startup
- [ ] Backend fails fast with clear error message if required env vars missing
- [ ] Frontend fails fast with clear error message if required env vars missing
- [ ] `INSTALLATION.md` updated with environment setup instructions
- [ ] `ENV_SETUP_GUIDE.md` updated with comprehensive variable documentation
- [ ] `.gitignore` properly excludes `.env` but includes `.env.example`
- [ ] Copy `.env.example` to `.env` → Application starts without errors
- [ ] Remove required env var → Application fails with clear error message
- [ ] No `process.env.X` calls scattered throughout code (use config object)
- [ ] TypeScript types for config object provide autocomplete and type safety

**Files Created/Modified**

- `/.env.example` (NEW)
- `/packages/backend/.env.example` (NEW, if needed)
- `/packages/frontend/.env.example` (NEW)
- `/packages/backend/src/lib/env.ts` (NEW - validation module)
- `/packages/frontend/src/lib/config.ts` (NEW - frontend config)
- `/packages/backend/src/index.ts` (UPDATE - call validation)
- `/docs/INSTALLATION.md` (UPDATE - add env setup section)
- `/docs/ENV_SETUP_GUIDE.md` (UPDATE - comprehensive variable docs)
- `/.gitignore` (UPDATE - ensure .env excluded)

**Tests Required**

- **Automated**: Create test that calls `validateEnv()` with missing required var → Verify throws error
- **Automated**: Create test that calls `validateEnv()` with invalid format (e.g., invalid PORT) → Verify throws error
- **Automated**: Create test that calls `validateEnv()` with all valid vars → Verify returns config object
- **Manual**: Delete `.env` file → Run `npm run dev --workspace @automechanica/backend` → Verify clear error message about missing .env
- **Manual**: Set invalid `PORT=999999` → Run backend → Verify validation error
- **Manual**: Copy `.env.example` to `.env` → Fill in only required vars → Verify app starts
- **Manual**: Review `ENV_SETUP_GUIDE.md` → Verify all variables in `.env.example` are documented

**Dependencies**

- **Blocks**: Phase 2 (database tasks need DATABASE_URL), Phase 4 (LLM Router needs API keys)
- **Blocked By**: Task 1.2.1 (needs backend structure)

**Estimated Effort**

- **Medium** (3-4 hours including documentation)

**Metadata**

- Branch: `feature/phase1-env-configuration`
- StartedBy:
- StartedAt:
- CompletedBy:
- CompletedAt:
- PR:
- Commit:
- TestsPassing:
- Notes:

---

#### 1.2.4 — Git Hooks & Pre-commit Checks

- [✓] 🟡 **P1-HIGH** — Setup Husky for automated quality checks

**Description**

Install and configure Husky with lint-staged to automatically run linting, type checking, and formatting on git commits. This prevents broken code from entering the repository and maintains code quality standards.

**Why This Matters:**
- **Quality Gates**: Catch errors before they reach CI/CD pipeline
- **Consistent Style**: Automatically format code on commit
- **Fast Feedback**: Developers get instant feedback on code quality issues
- **CI Cost Reduction**: Fewer failed CI builds = lower compute costs

**Implementation Notes for AI Agents**

**Step 1: Install Husky at Repository Root**

1. Navigate to repository root
2. Install Husky as dev dependency: `npm install -D husky`
3. Initialize Husky: `npm exec husky init`
   - This creates `.husky/` directory
   - Creates `.husky/pre-commit` hook file
4. Ensure `.husky/` is committed to git (not in .gitignore)

**Step 2: Install and Configure lint-staged**

1. Install lint-staged at repository root
2. Create `/lint-staged.config.js`
3. Configure to run appropriate checks based on file patterns:
   - **Backend TypeScript files**: Run linter with auto-fix, formatter, type check
   - **Frontend TypeScript/React files**: Run linter with auto-fix, formatter, type check
   - **JSON/Markdown/Config files**: Run formatter
4. Keep checks fast - only run on staged files, not entire codebase

**Step 3: Configure Pre-commit Hook**

Edit `/.husky/pre-commit`:
1. Add shebang: `#!/usr/bin/env sh`
2. Add Husky source line: `. "$(dirname "$0")/_/husky.sh"`
3. Add lint-staged command: `npm exec lint-staged`
4. Make file executable: `chmod +x .husky/pre-commit`

**Step 4: Create Commit Message Validation (Optional but Recommended)**

Create `/.husky/commit-msg`:
1. Validate commit message follows team conventions
2. Consider using conventional commits format (type(scope): message)
3. Reject commits that don't match format
4. Provide helpful error messages showing correct format
5. Make hook file executable

**Step 5: Configure package.json Scripts**

Update `/package.json` at repository root:
1. Add "prepare" script: `"prepare": "husky"` (runs on `npm install`)
2. Add "lint" script: `"lint": "npm --workspaces --if-present run lint"` (runs lint in all packages)
3. Add "typecheck" script: `"typecheck": "npm --workspaces --if-present run typecheck"` (type check all packages)
4. Add "format" script: `"format": "prettier --write \"**/*.{ts,tsx,json,md}\""` (format all files)
5. Add "format:check" script: `"format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""` (check formatting)

**Step 6: Create Documentation**

Update `/docs/CODE_STYLE_AND_CONVENTIONS.md`:
1. Add "Git Hooks" section explaining:
   - What Husky does
   - What checks run on pre-commit
   - How to bypass hooks in emergencies (NOT recommended)
   - Commit message format requirements
   - How to manually run checks before committing

**Step 7: Update INSTALLATION.md**

Update `/docs/INSTALLATION.md`:
1. Note that git hooks are automatically installed on `npm install`
2. Explain what developers will see when they commit (linting/formatting output)
3. Add troubleshooting section if hooks don't run (check file permissions, .husky directory)

**Step 8: Test Hook Configuration**

1. Make an intentional linting error (e.g., add `console.log("test")` without semicolon)
2. Try to commit → Verify pre-commit hook catches error
3. Fix error, commit again → Verify commit succeeds
4. Verify `npm install` in fresh clone automatically sets up hooks

**Acceptance Criteria**

- [ ] Husky installed and initialized at repository root
- [ ] `.husky/pre-commit` hook exists and is executable
- [ ] `.husky/commit-msg` hook exists and validates commit messages (optional)
- [ ] `lint-staged.config.js` configured for TypeScript files
- [ ] Root `package.json` has "prepare" script for Husky
- [ ] Committing TypeScript file with linting error → Hook fails, commit blocked
- [ ] Committing TypeScript file with formatting issue → Hook auto-formats, commit succeeds
- [ ] Committing with invalid commit message → Hook fails (if commit-msg hook enabled)
- [ ] `npm install` in fresh clone → Hooks automatically installed
- [ ] Documentation updated explaining git hooks and commit format
- [ ] Hooks run only on staged files (not entire codebase) for speed

**Files Created/Modified**

- `/.husky/pre-commit` (NEW)
- `/.husky/commit-msg` (NEW, optional)
- `/lint-staged.config.js` (NEW)
- `/package.json` (UPDATE - add scripts)
- `/docs/CODE_STYLE_AND_CONVENTIONS.md` (UPDATE - add git hooks section)
- `/docs/INSTALLATION.md` (UPDATE - note automatic hook setup)

**Tests Required**

- **Manual**: Create file with linting error → `git commit` → Verify blocked
- **Manual**: Create file with formatting issue → `git commit` → Verify auto-formatted
- **Manual**: Use invalid commit message → `git commit` → Verify blocked (if commit-msg hook)
- **Manual**: Run `npm install` in fresh clone → Verify `.husky` directory created
- **Manual**: Check hook execution time → Should complete in <10 seconds for typical commit
- **Manual**: Stage 10+ files → Verify hooks only run on staged files, not entire project

**Dependencies**

- **Blocks**: None (quality improvement, doesn't block other work)
- **Blocked By**: Task 1.2.1 (needs ESLint/Prettier configured), Task 1.2.2 (needs frontend linting)

**Estimated Effort**

- **Small** (2-3 hours including testing)

**Metadata**

- Branch: `feature/phase1-git-hooks`
- StartedBy:
- StartedAt:
- CompletedBy:
- CompletedAt:
- PR:
- Commit:
- TestsPassing:
- Notes:

---

#### 1.2.5 — CI/CD Pipeline (GitHub Actions)

- [✓] 🔴 **P0-CRITICAL** — Setup automated testing and build pipeline

**Description**

Implement comprehensive CI/CD pipeline using GitHub Actions that runs tests, linting, type checking, and builds on every PR and push. This ensures code quality and prevents broken code from reaching main branch.

**Why This Matters:**
- **Automated Quality**: Every PR is automatically tested before merge
- **Fast Feedback**: Developers know immediately if changes break tests
- **Prevent Regressions**: Catch bugs before they reach production
- **Build Validation**: Ensure code compiles and builds successfully
- **Team Confidence**: Safe to merge with green CI checks

**Implementation Notes for AI Agents**

**Step 1: Create CI Workflow File**

Create `/.github/workflows/ci.yml`:

1. Configure triggers:
   - Run on push to main branch
   - Run on pull requests to main
   - Allow manual workflow dispatch

2. Design job strategy:

**Separate jobs for different concerns** (parallel execution, clear failure identification):

- **Linting Job**: Run ESLint across all packages
- **Format Check Job**: Verify code is properly formatted
- **Type Check Job**: Run TypeScript compiler in validation mode
- **Backend Tests Job**: Run backend test suite with coverage
- **Frontend Tests Job**: Run frontend test suite with coverage
- **Build Job**: Compile both packages, depends on all previous jobs passing

3. For each job:
   - Use recent Ubuntu runner
   - Checkout code with appropriate depth
   - Setup Node.js (match project version requirements)
   - Use npm workspaces (match project version)
   - **Cache dependencies** efficiently (hash of lock file)
   - Install dependencies with frozen lockfile
   - Run appropriate commands for that job
   - Upload artifacts/coverage as needed

4. **Optimize for speed**:
   - Parallel job execution where possible
   - Dependency caching
   - Appropriate timeout values

**Step 2: Create Dependency Review Workflow**

Create `/.github/workflows/dependency-review.yml`:
1. Triggers on `pull_request`
2. Use `actions/dependency-review-action@v3`
3. Fails PR if new dependencies have known vulnerabilities
4. Checks for license compatibility

**Step 3: Create CodeQL Security Scanning Workflow (Optional but Recommended)**

Create `/.github/workflows/codeql.yml`:
1. Triggers on `push` to main, `pull_request`, and `schedule` (weekly)
2. Use `github/codeql-action` for automated security scanning
3. Analyze both TypeScript codebases (backend and frontend)
4. Create security alerts for vulnerabilities found

**Step 4: Add Branch Protection Rules**

Create documentation file `/docs/GITHUB_SETUP.md`:
1. Document required branch protection rules for `main` branch:
   - Require PR before merging
   - Require status checks to pass:
     - Lint
     - Type Check
     - Test Backend
     - Test Frontend
     - Build
   - Require branches to be up to date before merging
   - Require conversation resolution before merging
   - Enforce for administrators: Yes
2. Provide step-by-step instructions for repository admin to configure these settings
3. Include screenshots or detailed GitHub UI navigation

**Step 5: Add Status Badge to README**

Update `/README.md`:
1. Add CI status badge at top:
   ```markdown
   ![CI Status](https://github.com/[owner]/[repo]/workflows/CI/badge.svg)
   ```
2. Add link to Actions page
3. Document what CI checks are run

**Step 6: Create Local CI Simulation Script**

Create `/scripts/ci-local.sh` (or `.ps1` for Windows):
1. Script that runs all CI checks locally:
   - `npm run lint --workspaces`
   - `npm run typecheck --workspaces`
   - `npm run test:run --workspace @automechanica/backend`
   - `npm run test:run --workspace @automechanica/frontend`
   - `npm run build --workspace @automechanica/backend`
   - `npm run build --workspace @automechanica/frontend`
2. Exit with code 1 if any step fails
3. Print summary of results
4. Add to package.json scripts as `"ci:local": "./scripts/ci-local.sh"`

**Step 7: Optimize CI Performance**

1. Enable dependency caching (already in steps above)
2. Use npm workspaces efficiently:
   - Leverage lockfile caching to prevent repeated installs
   - Parallel execution where possible
3. Set appropriate timeout for jobs (default 60 minutes may be too long)
4. Consider matrix strategy for testing multiple Node versions (optional)

**Step 8: Document CI/CD Process**

Update `/docs/DEPLOYMENT.md`:
1. Add "Continuous Integration" section
2. Explain what each CI job does
3. Document how to interpret CI failures
4. Provide troubleshooting guide for common CI issues:
   - Flaky tests
   - Dependency installation failures
   - Timeout issues
   - Cache corruption
5. Explain branch protection rules and merge requirements

**Acceptance Criteria**

- [ ] `/.github/workflows/ci.yml` exists and configured
- [ ] CI runs on every push to main and every pull request
- [ ] All jobs (Lint, Type Check, Test Backend, Test Frontend, Build) complete successfully
- [ ] Failed test causes CI to fail (red X on PR)
- [ ] Passed tests show green checkmark on PR
- [ ] Dependency caching works (second run faster than first)
- [ ] Build artifacts generated and stored
- [ ] Branch protection rules documented in `GITHUB_SETUP.md`
- [ ] CI status badge in README.md
- [ ] Local CI simulation script (`ci:local`) works
- [ ] CI completes in <10 minutes for typical changes
- [ ] Failed builds provide clear error messages

**Files Created/Modified**

- `/.github/workflows/ci.yml` (NEW)
- `/.github/workflows/dependency-review.yml` (NEW)
- `/.github/workflows/codeql.yml` (NEW, optional)
- `/docs/GITHUB_SETUP.md` (NEW)
- `/scripts/ci-local.sh` (NEW)
- `/README.md` (UPDATE - add CI badge)
- `/docs/DEPLOYMENT.md` (UPDATE - add CI documentation)
- `/package.json` (UPDATE - add ci:local script)

**Tests Required**

- **Manual**: Create PR with passing tests → Verify all CI checks pass (green)
- **Manual**: Create PR with intentional test failure → Verify CI fails (red)
- **Manual**: Create PR with linting error → Verify Lint job fails
- **Manual**: Create PR with type error → Verify Type Check job fails
- **Manual**: Create PR with build error → Verify Build job fails
- **Manual**: Check CI execution time → Should be <10 minutes
- **Manual**: Run `npm run ci:local` → Verify replicates CI checks locally
- **Manual**: Review Actions tab on GitHub → Verify workflow runs appear

**Dependencies**

- **Blocks**: Phase 2+ (all future work relies on CI for quality assurance)
- **Blocked By**: Task 1.2.1 (backend tests), Task 1.2.2 (frontend tests)

**Estimated Effort**

- **Medium** (4-5 hours including testing and documentation)

**Metadata**

- Branch: `feature/phase1-ci-cd-pipeline`
- StartedBy:
- StartedAt:
- CompletedBy:
- CompletedAt:
- PR:
- Commit:
- TestsPassing:
- Notes:

---

### 1.3 — Database Foundation

#### 1.3.1 - PostgreSQL Setup & Docker Compose

- [û] 🔴 **P0-CRITICAL** - Setup local PostgreSQL with Docker

**Description**

Create Docker Compose configuration for local PostgreSQL database with pgvector extension. This provides a consistent database environment for all developers and eliminates "works on my machine" issues.

**Why This Matters:**
- **Consistency**: Every developer has identical database setup
- **Ease of Use**: One command (`docker-compose up`) starts database
- **pgvector Ready**: Extension pre-installed for vector similarity search
- **Data Persistence**: Volumes ensure data survives container restarts
- **Clean Slate**: Easy to reset database to fresh state

**Implementation Notes for AI Agents**

**Step 1: Create Docker Compose Configuration**

Create `/docker-compose.yml` at repository root:

1. Define **PostgreSQL service**:
   - Use PostgreSQL image with pgvector extension pre-installed (e.g., pgvector/pgvector)
   - Choose appropriate PostgreSQL version (15+ recommended)
   - Configure environment variables from .env file (user, password, database name)
   - Expose standard PostgreSQL port
   - Set up data persistence with named volume
   - Mount initialization script for extension setup
   - Configure health check (pg_isready command)
   - Set restart policy for reliability

2. Define **pgAdmin service** (optional - useful for database GUI):
   - Use official pgAdmin image
   - Configure default credentials
   - Expose web interface port
   - Set dependency on PostgreSQL service

3. Define volumes:
   - Named volume for PostgreSQL data persistence

**Step 2: Create Database Initialization Script**

Create `/scripts/init-db.sql`:
1. Enable pgvector extension (required for vector similarity search)
2. Add verification query to confirm extension loaded
3. Note: Schema will be managed by Prisma migrations in Phase 2

**Step 3: Add Database Management Scripts**

Update `/package.json` at repository root with convenience scripts:
- **db:start**: Start PostgreSQL container in background
- **db:stop**: Stop PostgreSQL container
- **db:restart**: Restart PostgreSQL container
- **db:logs**: View PostgreSQL logs (follow mode)
- **db:reset**: Delete all data and recreate database (use with caution!)
- **db:shell**: Open psql shell for direct database access
- **pgadmin:start**: Start pgAdmin web interface (if included)

**Step 4: Update .env.example**

Update `/.env.example`:
1. Ensure DATABASE_URL matches Docker Compose configuration:
   ```
   DATABASE_URL=postgresql://automechanica:dev_password@localhost:5432/automechanica
   ```
2. Add Docker-specific variables:
   ```
   POSTGRES_USER=automechanica
   POSTGRES_PASSWORD=dev_password
   POSTGRES_DB=automechanica
   ```

**Step 5: Update .gitignore**

Update `/.gitignore`:
1. Add Docker-related ignores:
   ```
   # Docker
   .docker/
   docker-compose.override.yml
   ```
2. Ensure `.env` is ignored (database credentials)

**Step 6: Create Database Connection Test**

Create `/packages/backend/src/lib/db-test.ts`:
1. Install PostgreSQL client library (pg) and types
2. Create test function that:
   - Reads DATABASE_URL from configuration
   - Connects to PostgreSQL
   - Runs simple query (verify connection works)
   - Checks pgvector extension is installed
   - Logs results
   - Handles errors gracefully
   - Closes connection

Create `/packages/backend/src/scripts/test-db-connection.ts`:
- Import and execute test function
- Exit with appropriate code (0 success, 1 failure)

Add to backend package.json scripts:
- **db:test**: Run database connection test

**Step 7: Update Documentation**

Update `/docs/INSTALLATION.md`:
1. Add "Database Setup" section:
   - Prerequisites: Docker and Docker Compose installed
   - Step 1: Start database: `npm run db:start`
   - Step 2: Verify database is running: `npm run db:logs`
   - Step 3: Test connection: `npm run db:test --workspace @automechanica/backend`
   - Note: First startup takes longer (downloading Docker image)
2. Add "Database Management" section:
   - Stop database: `npm run db:stop`
   - View logs: `npm run db:logs`
   - Access psql shell: `npm run db:shell`
   - Reset database (delete all data): `npm run db:reset`
   - Access pgAdmin UI: `npm run pgadmin:start` then open http://localhost:5050

3. Add troubleshooting:
   - Port 5432 already in use → Stop other PostgreSQL instances
   - Permission errors → Check Docker permissions
   - Connection refused → Wait for health check to pass

Create `/docs/DATABASE_MANAGEMENT.md` (new file):
1. Document database architecture:
   - PostgreSQL 15 with pgvector extension
   - Docker Compose for local development
   - Data persistence via Docker volumes
2. Document common operations:
   - Starting/stopping database
   - Accessing database shell
   - Viewing logs
   - Resetting database
   - Backing up data
   - Restoring from backup
3. Document pgvector usage:
   - Vector data type
   - Similarity search operators (<->, <#>, <=>)
   - Index types (IVFFlat, HNSW)
   - Best practices for vector embeddings

**Step 8: Test Database Setup**

1. Start database: `npm run db:start`
2. Wait for health check to pass (check logs)
3. Run connection test: `npm run db:test --workspace @automechanica/backend`
4. Access psql shell: `npm run db:shell`
5. Verify pgvector: `\dx vector`
6. Stop database: `npm run db:stop`
7. Reset database: `npm run db:reset`
8. Verify data is cleared


**Acceptance Criteria**

- [x] `/docker-compose.yml` exists with PostgreSQL and pgAdmin services
- [x] `/scripts/init-db.sql` enables pgvector extension
- [x] `npm run db:start` starts PostgreSQL container
- [x] `npm run db:logs` shows PostgreSQL logs
- [x] `npm run db:shell` opens psql shell
- [x] `npm run db:test --workspace @automechanica/backend` verifies connection
- [x] pgvector extension is installed and queryable
- [x] Database data persists across container restarts
- [x] `npm run db:reset` clears all data and recreates database
- [x] `INSTALLATION.md` updated with database setup instructions
- [x] `DATABASE_MANAGEMENT.md` created with comprehensive docs
- [x] .env.example updated with correct DATABASE_URL
- [x] Health check passes before accepting connections

**Files Created/Modified**

- `/docker-compose.yml` (NEW)
- `/scripts/init-db.sql` (NEW)
- `/packages/backend/src/lib/db-test.ts` (NEW)
- `/packages/backend/src/scripts/test-db-connection.ts` (NEW)
- `/docs/DATABASE_MANAGEMENT.md` (NEW)
- `/package.json` (UPDATE - add db:* scripts)
- `/packages/backend/package.json` (UPDATE - add db:test script, add pg dependency)
- `/.env.example` (UPDATE - add database variables)
- `/.gitignore` (UPDATE - add Docker ignores)
- `/docs/INSTALLATION.md` (UPDATE - add database setup section)

**Tests Required**

- **Manual**: `npm run db:start` → Verify container starts
- **Manual**: `npm run db:logs` → Verify no errors in logs
- **Manual**: `npm run db:test --workspace @automechanica/backend` → Verify connection successful
- **Manual**: `npm run db:shell` → Run `\dx` → Verify pgvector extension listed
- **Manual**: `npm run db:stop && npm run db:start` → Verify data persists
- **Manual**: `npm run db:reset` → Verify database cleared
- **Manual**: `npm run pgadmin:start` → Open http://localhost:5050 → Verify can connect to database
- **Manual**: Check Docker volume exists: `docker volume ls | grep postgres-data`

**Dependencies**

- **Blocks**: Phase 2 (all database/schema tasks need PostgreSQL running)
- **Blocked By**: Task 1.2.3 (needs .env.example with DATABASE_URL)

**Estimated Effort**

- **Small** (2-3 hours including testing)

**Metadata**

- Branch: `feature/phase1-postgres-setup`
- StartedBy: Codex
- StartedAt: 2025-12-02 12:00
- CompletedBy: Codex
- CompletedAt: 2025-12-02 12:10
- PR:
- Commit:
- TestsPassing: YES (backend/frontend vitest, lint, typecheck passing locally)
- Notes: Added Dockerized Postgres/pgvector setup, connection test utilities, and database docs. CI format job temporarily disabled until Prettier baseline (see 1.4.1).

---

- `.env.example`
- Possibly `/backend/.env.example`

**Tests**

- Manual: run backend with `.env` derived from `.env.example` and confirm it starts successfully.

---

### 1.4 - Formatting Baseline (Deferred)

#### 1.4.1 - Establish Prettier baseline & re-enable CI format job

- [ ] 🟠 **P1-HIGH** - Apply repository-wide Prettier formatting and restore CI format check

**Description**
Current CI format job is temporarily disabled because the repository has not been normalized with Prettier. Run Prettier across the repo, commit the baseline, and re-enable the format job in `.github/workflows/ci.yml`.

**Acceptance Criteria**
- [ ] Prettier run across repo completes with no changes pending.
- [ ] `.github/workflows/ci.yml` format job is enabled (remove the skip condition).
- [ ] `npm run format:check` passes locally and in CI.
- [ ] No functional code changes beyond formatting.

**Files Created/Modified**
- Formatting across existing files (docs, configs, source).
- `.github/workflows/ci.yml` (re-enable format job).

**Tests**
- `npm run format:check`
- CI format job passes.

**Notes**
- Coordinate with active branches to avoid merge conflicts; consider running after major in-flight branches land.

---

## PHASE 2 - Database, Domain Model & Migrations

**Goal:** Implement the relational schema from `DOMAIN_MODEL.md` with migrations, models, and basic data access.

---

### 2.1 — Postgres & pgvector Setup in Code

#### 2.1.1 — DB client and config

- [x] 🔴 **P0-CRITICAL** — Setup DB connection layer

**Description**  
Create a single database access layer that can be reused across the backend services, using either an ORM (Prisma, Sequelize) or a query builder (Knex). Follow `CODE_STYLE_AND_CONVENTIONS.md`.

**Why This Matters**

The database client is the foundation for all data persistence. A well-designed abstraction:
- Ensures consistent connection management across all services
- Provides type safety for queries (especially with TypeScript)
- Enables centralized error handling and logging
- Makes testing easier through mockability
- Prevents connection pool exhaustion through proper resource management

Chose the right tool based on project needs:
- **Prisma**: Best for strong TypeScript integration, auto-generated types, migration tooling
- **Knex**: More flexible for complex queries, better for teams preferring raw SQL control
- **Sequelize**: Good for teams familiar with ActiveRecord pattern

The singleton pattern prevents connection pool fragmentation and ensures consistent configuration.

**Implementation Principles**

1. **ORM/Query Builder Selection**
   - Evaluate trade-offs between type safety, migration tooling, query flexibility
   - Consider team familiarity and TypeScript integration quality
   - Prisma recommended for this project due to strong typing and pgvector support potential
   - Whatever tool chosen, ensure it supports PostgreSQL-specific features (JSONB, arrays, vector extension)

2. **Connection Management Architecture**
   - Design a singleton client module that initializes once at application startup
   - Read `DATABASE_URL` from environment variables (validate format)
   - Configure connection pooling:
     - Set appropriate pool size for expected concurrency (consider worker processes)
     - Configure timeout values for connection acquisition
     - Set statement timeout to prevent long-running queries from blocking
   - Ensure connection is reusable across all backend modules
   - Prevent accidental multiple client instantiations

3. **Error Handling Strategy**
   - Implement graceful failure at startup if database is unreachable:
     - Log clear, actionable error messages (include connection string host/port, not password)
     - Exit process with non-zero code (container orchestration can restart)
     - Don't fall back to degraded mode silently
   - For runtime connection errors:
     - Log errors with context (query type, affected resource)
     - Throw exceptions that calling code can catch and handle
     - Consider retry logic with exponential backoff for transient failures
   - Differentiate between connection errors, query errors, and constraint violations

4. **Schema Definition & Migrations**
   - If using Prisma:
     - Define schema that exactly matches `DOMAIN_MODEL.md` entities
     - Use appropriate field types (UUID for IDs, JSONB for flexible attributes, TIMESTAMP for dates)
     - Configure migration generation and application strategy
     - Ensure development vs production migration workflows are documented
   - If using Knex:
     - Set up migration directory structure
     - Create initial migration templates
     - Document migration creation and rollback procedures
   - All schemas should follow naming conventions from `CODE_STYLE_AND_CONVENTIONS.md`

5. **Testing & Mockability**
   - Design client interface that can be easily mocked in tests
   - Export type definitions for query results
   - Ensure test isolation (tests shouldn't share transaction state)
   - Consider test database seeding strategy

**Implementation Steps**

**Step 1: Initialize ORM/Query Builder**
- Install chosen library and PostgreSQL driver
- Create configuration file (e.g., `prisma/schema.prisma` or `knexfile.ts`)
- Configure database connection string reading from environment
- Set up TypeScript path aliases if needed

**Step 2: Implement Client Module**
- Create `/backend/src/db/client.ts` (or appropriate path)
- Implement singleton initialization:
  - Lazy initialization or eager at startup (choose based on architecture)
  - Validate `DATABASE_URL` format and required parameters
  - Configure connection pool with appropriate limits
- Export client instance and relevant types
- Add connection health check method

**Step 3: Error Handling Implementation**
- Wrap connection initialization in try-catch
- Log errors with structured logging (include timestamp, error type, connection details)
- Implement graceful shutdown handler that closes connection pool
- Document error codes and meanings

**Step 4: Schema Setup**
- Define initial schema matching domain model entities
- Create first migration (or generate from Prisma schema)
- Test migration application on fresh database
- Document migration workflow in `ENV_SETUP_GUIDE.md`

**Step 5: Testing Infrastructure**
- Create test database configuration
- Implement test helpers for:
  - Database seeding
  - Transaction rollback between tests
  - Mock client for unit tests
- Write connection verification test

**Step 6: Documentation**
- Update `ENV_SETUP_GUIDE.md` with:
  - Required `DATABASE_URL` format and examples
  - Migration commands
  - Troubleshooting common connection issues
- Document connection pool configuration rationale
- Add code comments explaining singleton pattern usage

**Acceptance Criteria**

- [ ] Database client successfully connects to PostgreSQL using `DATABASE_URL`
- [ ] Connection failure at startup produces clear error message with actionable information
- [ ] Process exits with non-zero code if database is unreachable at startup
- [ ] Client uses connection pooling with configured limits
- [ ] Singleton pattern prevents multiple client instances
- [ ] Client is properly typed for TypeScript (no `any` types in core interfaces)
- [ ] Migration system is configured and can apply/rollback migrations
- [ ] Test can import client and execute simple query (`SELECT 1` or equivalent)
- [ ] Graceful shutdown closes connection pool without hanging
- [ ] Documentation includes `DATABASE_URL` format and troubleshooting guide

**Files Created/Modified**

- `/backend/src/db/client.ts` — Database client singleton
- `/backend/src/db/types.ts` — Type definitions (if needed)
- `prisma/schema.prisma` OR `knexfile.ts` — ORM/query builder configuration
- `/backend/tests/db/connection.test.ts` — Connection verification test
- Update `ENV_SETUP_GUIDE.md` — Database setup instructions
- Update `package.json` — Add migration scripts

**Test Requirements**

1. **Connection Test**: Verify client can connect and execute simple query
2. **Error Handling Test**: Mock connection failure and verify error logging
3. **Singleton Test**: Verify multiple imports return same client instance
4. **Pool Management Test**: Verify connections are released back to pool
5. **Migration Test**: Verify migrations can be applied and rolled back

**Dependencies**

- Requires: Task 1.3.1 (PostgreSQL Docker setup) completed
- Requires: Task 1.2.3 (Environment configuration) for `DATABASE_URL`
- Blocks: All Phase 2.2+ tasks (schema creation depends on this)

**Metadata**

- Branch: `feature/phase2-db-client`
- StartedBy: Codex
- StartedAt: 2025-12-02
- CompletedBy: Codex
- CompletedAt: 2025-12-02
- PR:
- Commit:
- TestsPassing: YES (backend db client/unit tests, backend/frontend test suites, lint, typecheck)
- Notes: Added pg-based pool singleton, startup check, migration tooling via node-pg-migrate, pgvector extension migration, and migration docs.

---

#### 2.1.2 - pgvector extension support

- [x] 🔴 **P0-CRITICAL** - Ensure pgvector integration

**Description**  
Integrate pgvector support according to `VECTOR_MEMORY_DESIGN.md` and ensure the database is prepared to store vector columns.

**Why This Matters**

Vector embeddings are critical for AutoMechanica's memory and similarity search capabilities:
- Enable semantic search across agent events for improved reasoning
- Support part similarity matching for ProductDataAgent
- Power context retrieval for LLM prompts
- Foundation for long-term memory architecture

The pgvector extension must be enabled before any vector columns can be created. Extension setup often requires superuser privileges, which may not be available in all deployment environments (especially managed databases). This task ensures the extension is properly enabled and provides clear fallback documentation for restricted environments.

**Implementation Principles**

1. **Extension Installation Strategy**
   - Attempt automatic installation via migration for development/self-hosted scenarios
   - Handle permission failures gracefully (some environments prohibit extension creation by app users)
   - Provide clear documentation for manual installation in restricted environments
   - Extension creation is idempotent (`IF NOT EXISTS`) to support repeated runs

2. **Permission Handling**
   - Database user running migrations may not have `CREATE EXTENSION` privilege
   - Design migration to:
     - Try automatic creation first
     - Detect permission errors vs other failures
     - Log clear guidance if automatic creation fails
   - Document required privileges for database administrators

3. **ORM Vector Type Support**
   - Different ORMs handle custom PostgreSQL types differently:
     - **Prisma**: May require `Unsupported("vector(N)")` or raw SQL migrations
     - **Knex**: Use `.specificType('embedding', 'vector(1536)')` in migrations
     - **Sequelize**: Custom data type definition required
   - Ensure chosen approach supports vector dimensionality specification
   - Verify that vector columns can be queried and inserted via ORM

4. **Vector Dimensionality Planning**
   - Different embedding models produce different dimensions:
     - OpenAI text-embedding-3-small: 1536 dimensions
     - OpenAI text-embedding-ada-002: 1536 dimensions
     - Sentence transformers: varies (384, 768, 1024 common)
   - Design schema to specify dimension per table (flexible for future model changes)
   - Document which embedding model corresponds to which dimension

**Implementation Steps**

**Step 1: Create Extension Migration**
- Create new migration file (e.g., `001_enable_pgvector.sql` or equivalent)
- Write SQL command: `CREATE EXTENSION IF NOT EXISTS vector;`
- Configure migration to:
  - Execute against target database
  - Handle existing extension gracefully
  - Log success or failure clearly

**Step 2: Test Extension Creation**
- Run migration against local development database
- Verify extension exists: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Test vector type availability: attempt to create test table with vector column
- Document any warnings or permission issues encountered

**Step 3: Handle Permission Failures**
- Wrap migration execution in error handling
- Detect permission-denied errors specifically
- Log actionable message:
  - "pgvector extension requires superuser privileges"
  - "See INSTALLATION.md for manual setup instructions"
- Don't fail silently — make it clear extension is required

**Step 4: Document Manual Installation**
- Update `INSTALLATION.md` with:
  - Manual SQL command for database admins: `CREATE EXTENSION IF NOT EXISTS vector;`
  - Instructions for managed databases (RDS, Cloud SQL, etc.)
  - How to verify extension is installed
  - Troubleshooting common issues
- Update `ENV_SETUP_GUIDE.md` with:
  - Extension version compatibility (pgvector 0.5.0+ recommended)
  - Installation steps for different PostgreSQL versions

**Step 5: Configure ORM Vector Type Support**
- If using Prisma:
  - Use `Unsupported("vector(1536)")` for embedding columns, OR
  - Use raw SQL migrations for vector column definitions
  - Document type casting requirements in queries
- If using Knex:
  - Create helper function for vector column creation
  - Example: `table.specificType('embedding', 'vector(1536)')`
- Test ORM can insert and query vector data

**Step 6: Create Test Vector Table**
- Create simple test migration with vector column
- Verify migration succeeds (depends on extension being enabled)
- Write test that:
  - Inserts vector data
  - Queries vector data
  - Performs basic similarity search (cosine distance)
- Document vector query patterns for future use

**Step 7: Update Documentation**
- Document in `VECTOR_MEMORY_DESIGN.md`:
  - Extension version used
  - Dimension standards for different embedding models
  - Performance characteristics (index types, query patterns)
- Add to `INSTALLATION.md`:
  - Manual extension installation steps
  - Verification procedures
  - Troubleshooting permission errors

**Acceptance Criteria**

- [ ] pgvector extension migration is created
- [ ] Migration successfully enables extension in local development environment
- [ ] Extension creation is idempotent (can run multiple times safely)
- [ ] Permission failures produce clear, actionable error messages
- [ ] `INSTALLATION.md` documents manual installation procedure with SQL commands
- [ ] `INSTALLATION.md` includes instructions for managed database services
- [ ] ORM is configured to support vector type columns
- [ ] Test migration with vector column succeeds after extension is enabled
- [ ] Can insert and query vector data through ORM
- [ ] Vector column dimensionality is configurable per table
- [ ] Documentation explains dimension choices for different embedding models

**Files Created/Modified**

- `/backend/prisma/migrations/001_enable_pgvector.sql` (or equivalent)
- `/backend/tests/db/vector.test.ts` — Vector functionality test
- Update `INSTALLATION.md` — Manual extension installation steps
- Update `ENV_SETUP_GUIDE.md` — Extension setup and troubleshooting
- Update `VECTOR_MEMORY_DESIGN.md` — Extension configuration details

**Test Requirements**

1. **Extension Existence Test**: Query `pg_extension` table to verify extension is installed
2. **Vector Column Creation Test**: Create table with vector column, verify schema
3. **Vector Data Insertion Test**: Insert embedding array, verify persistence
4. **Vector Query Test**: Retrieve vector data, verify dimensions preserved
5. **Similarity Search Test**: Perform basic cosine distance query, verify results ordered correctly
6. **Permission Failure Test**: Mock permission error, verify error message clarity

**Dependencies**

- Requires: Task 2.1.1 (DB client setup) for migration runner
- Requires: Task 1.3.1 (PostgreSQL Docker) with pgvector support compiled in
- Blocks: Vector memory implementation (future phase)
- Blocks: Agent event embedding storage (Phase 2.3.2)

---

### 2.2 — Core Tables (Vehicles, Parts, SupplierParts, Fitments)

#### 2.2.1 — Vehicles table & model

- [x] 🔴 **P0-CRITICAL** — Implement `vehicles` schema

**Description**  
Create the Vehicle table and model exactly as described in `DOMAIN_MODEL.md`.

**Why This Matters**

Vehicles are the central filtering concept for the entire platform:
- Every fitment relationship connects parts to vehicles
- User's active vehicle drives all browse and search results
- Vehicle uniqueness prevents data duplication and ensures accurate fitment tracking
- Clean vehicle data enables reliable year/make/model/trim/engine (YMMTE) filtering

The combination of (year, make, model, trim, engine) must be unique to prevent duplicate vehicle entries from supplier feeds or user submissions. This constraint ensures data integrity and simplifies fitment matching logic.

**Implementation Principles**

1. **Schema Design Requirements**
   - Follow `DOMAIN_MODEL.md` vehicle entity specification exactly
   - Use appropriate data types:
     - `id`: UUID primary key (universally unique, not sequential)
     - `year`: Integer (4-digit year, validate range 1900-2100)
     - `make`: Text (normalized manufacturer name, e.g., "Ford", "Toyota")
     - `model`: Text (model name, e.g., "Mustang", "Camry")
     - `trim`: Text (trim level, e.g., "GT", "LE", can be nullable for base models)
     - `engine`: Text (engine description, e.g., "2.0L Turbo I4", "5.0L V8")
     - `created_at`: Timestamp with timezone (audit trail)
   - Consider normalization:
     - Should make/model be foreign keys to separate tables? (Decision: keep denormalized for MVP simplicity)
     - Future: Consider make/model reference tables for dropdown population

2. **Uniqueness Constraint Strategy**
   - Implement composite unique constraint on `(year, make, model, trim, engine)`
   - This prevents duplicate vehicles in database
   - Handle uniqueness at multiple levels:
     - Database constraint (primary enforcement)
     - Application-level check before insert (better error messages)
     - Model helper function `findOrCreateByKey` (convenience)
   - Design constraint to handle nullable `trim` appropriately
   - Consider case sensitivity: normalize make/model/trim to title case

3. **Model Interface Design**
   - Create TypeScript model with strong typing
   - Implement CRUD operations:
     - `createVehicle(data)`: Insert new vehicle, handle constraint violations gracefully
     - `findVehicleById(id)`: Simple lookup by UUID
     - `findVehicleByKey(year, make, model, trim, engine)`: Lookup by natural key
     - `findOrCreateByKey(...)`: Idempotent upsert operation (critical for ingestion)
     - `listVehicles(filters, pagination)`: Support frontend dropdown population
   - Return strongly-typed results (no `any` types)
   - Handle errors gracefully:
     - Unique constraint violations should return clear error
     - Not found should return null, not throw (for lookup operations)

4. **Data Normalization Patterns**
   - Make/Model/Trim should be normalized for consistency:
     - Trim whitespace
     - Convert to title case ("FORD" → "Ford")
     - Handle common abbreviations consistently ("Chev" vs "Chevrolet")
   - Engine descriptions should follow pattern: `displacement unit configuration`
     - Example: "2.0L Turbo I4", "5.0L V8"
   - Document normalization rules for future ingestion agents

**Implementation Steps**

**Step 1: Create Migration**
- Generate new migration for `vehicles` table
- Define schema with all required columns
- Set `id` as UUID primary key with default generation
- Add composite unique constraint: `UNIQUE(year, make, model, trim, engine)`
- Add index on `(make, model, year)` for common query pattern
- Set `created_at` default to current timestamp

**Step 2: Apply Migration**
- Run migration against development database
- Verify table exists with correct schema
- Test unique constraint manually:
  - Insert vehicle
  - Attempt duplicate insert, verify constraint error
- Verify indexes are created

**Step 3: Implement Model**
- Create `/backend/src/models/Vehicle.ts`
- Define `Vehicle` TypeScript interface matching schema
- Implement `createVehicle(data: VehicleInput): Promise<Vehicle>`:
  - Validate input (year range, required fields)
  - Normalize make/model/trim/engine
  - Handle unique constraint violation with clear error message
- Implement `findVehicleById(id: string): Promise<Vehicle | null>`
- Implement `findVehicleByKey(...): Promise<Vehicle | null>`
- Implement `findOrCreateByKey(...): Promise<{ vehicle: Vehicle, created: boolean }>`:
  - Try to find existing by key
  - If not found, create new
  - Return vehicle and flag indicating if created
  - Handle race conditions (concurrent creates)

**Step 4: Add Helper Functions**
- Implement `listVehicles(filters?, pagination?): Promise<Vehicle[]>`:
  - Support filtering by year, make, model
  - Support pagination (offset/limit or cursor-based)
  - Return ordered results (by year desc, make asc, model asc)
- Implement `searchVehicles(query: string): Promise<Vehicle[]>`:
  - Simple text search across make/model fields
  - Use for autocomplete functionality

**Step 5: Write Tests**
- Create `/backend/tests/models/Vehicle.test.ts`
- Test cases:
  - Create vehicle successfully
  - Duplicate vehicle fails with clear error
  - Find by ID returns correct vehicle
  - Find by key returns correct vehicle
  - FindOrCreate creates new vehicle when needed
  - FindOrCreate returns existing vehicle when found
  - Normalization works correctly (case, whitespace)
  - Pagination works
  - Search returns relevant results

**Step 6: Document Data Patterns**
- Update `DOMAIN_MODEL.md` with:
  - Vehicle normalization rules
  - Example valid vehicle entries
  - Uniqueness constraint rationale
- Add code comments explaining:
  - Why composite unique constraint chosen
  - Normalization strategy
  - Race condition handling in findOrCreate

**Acceptance Criteria**

- [x] Migration creates `vehicles` table with correct schema
- [x] Composite unique constraint on `(year, make, model, trim, engine)` is enforced
- [x] Index on `(make, model, year)` exists for query performance
- [x] Attempting to insert duplicate vehicle produces database error
- [x] `createVehicle` function works and validates input
- [x] `findVehicleById` returns correct vehicle or null
- [x] `findVehicleByKey` returns vehicle matching all five attributes
- [x] `findOrCreateByKey` creates new vehicle when not exists
- [x] `findOrCreateByKey` returns existing vehicle when already exists
- [x] Make/model/trim are normalized to consistent format (title case, trimmed)
- [x] All model functions are strongly typed (TypeScript)
- [x] Unit tests cover CRUD operations and edge cases
- [x] Concurrent `findOrCreateByKey` calls don't create duplicates

**Files Created/Modified**

- `/backend/prisma/migrations/002_create_vehicles.sql` (or equivalent)
- `/backend/src/models/Vehicle.ts` — Vehicle model and operations
- `/backend/src/models/types.ts` — Shared type definitions (if needed)
- `/backend/tests/models/Vehicle.test.ts` — Comprehensive model tests
- Update `DOMAIN_MODEL.md` — Vehicle normalization patterns

**Test Requirements**

1. **Create Test**: Insert valid vehicle, verify returned data matches input
2. **Uniqueness Test**: Insert duplicate vehicle, verify error thrown
3. **Find by ID Test**: Create vehicle, retrieve by ID, verify match
4. **Find by Key Test**: Search by YMMTE attributes, verify correct vehicle returned
5. **FindOrCreate Test (New)**: Call with new YMMTE, verify vehicle created
6. **FindOrCreate Test (Existing)**: Call with existing YMMTE, verify no duplicate
7. **Normalization Test**: Insert vehicle with inconsistent casing, verify normalized
8. **Concurrency Test**: Parallel findOrCreate calls with same YMMTE, verify only one created
9. **List Test**: Create multiple vehicles, verify listing with filters
10. **Search Test**: Text search across make/model, verify relevant results

**Dependencies**

- Requires: Task 2.1.1 (DB client) for database access
- Requires: Task 2.1.2 (pgvector) migration system working
- Blocks: Task 2.2.2 (Fitments table needs vehicles to exist)

---

#### 2.2.2 — Parts, SupplierParts, Fitments tables & models

- [x] 🔴 **P0-CRITICAL** — Implement core part-related tables

**Description**  
Implement the core entities for canonical parts, supplier parts, and fitment relationships.

**Why This Matters**

These three tables form the heart of AutoMechanica's product catalog architecture:

**Parts (Canonical)**: Represent the "ground truth" product in our system
- Deduplicated across suppliers (many supplier SKUs → one canonical part)
- Enriched with AI-generated content, pricing, and fitment data
- What customers see and purchase

**SupplierParts**: Raw supplier catalog data
- Preserves original supplier information for traceability
- Links to canonical parts after normalization and matching
- Enables multi-supplier sourcing and price comparison

**Fitments**: Vehicle compatibility relationships
- Links parts to vehicles with confidence scores
- Powers "will this fit my car?" functionality
- Foundation for vehicle-aware browsing and search

The relationship flow: `SupplierPart → (normalized) → Part → (fitment analysis) → Fitment → Vehicle`

**Implementation Principles**

**1. Parts Table Design**

**Purpose**: Canonical, customer-facing product representation

**Schema Requirements**:
- `id`: UUID primary key (universal identifier)
- `name`: Text (customer-facing product name, e.g., "Front Brake Rotor")
- `category`: Text (product category, e.g., "Brakes", "Suspension")
- `brand`: Text (manufacturer/brand name, nullable for generic/OE parts)
- `description`: Text (AI-generated SEO content, nullable until generated)
- `attributes`: JSONB (flexible product attributes, e.g., `{"position": "front", "diameter_mm": 300, "thickness_mm": 28}`)
- `created_at`: Timestamp (audit trail)

**Design Considerations**:
- **Attributes JSONB**: Flexible schema allows different attributes per category without schema changes
  - Brake rotors: diameter, thickness, bolt pattern, hat style
  - Spark plugs: gap, thread size, heat range
  - Filters: dimensions, micron rating, flow rate
- **Normalization**: Name and brand should be normalized (title case, trim whitespace)
- **Uniqueness**: No unique constraint (allows duplicate products if truly different)
- **Indexing**: Index on `category` for category browsing, consider GIN index on `attributes` for JSONB queries

**Model Interface**:
- Strong TypeScript types for attributes per category
- CRUD operations with proper validation
- Filtering and search capabilities
- Pagination support for large catalogs

**2. SupplierParts Table Design**

**Purpose**: Preserve raw supplier data and track canonical part linkage

**Schema Requirements**:
- `id`: UUID primary key
- `supplier_id`: Text (supplier identifier, e.g., "carquest", "napa")
- `supplier_sku`: Text (supplier's product code)
- `raw_data`: JSONB (complete original supplier data, never modified)
- `normalized_data`: JSONB (structured attributes after normalization agent, nullable until processed)
- `canonical_part_id`: UUID foreign key to `parts.id` (nullable until matched)
- `cost`: Numeric (supplier cost in cents/minor units)
- `availability`: Text (stock status, e.g., "in_stock", "backordered", "discontinued")
- `lead_time_days`: Integer (delivery time in days)
- `created_at`: Timestamp
- **Unique constraint**: `(supplier_id, supplier_sku)` prevents duplicate imports

**Design Considerations**:
- **Raw vs Normalized**: Preserve raw data for audit/reprocessing, use normalized for matching
- **Nullable Canonical Link**: SupplierParts exist before ProductDataAgent matches them
- **Cost Storage**: Store in cents/minor currency units to avoid floating point issues
- **Availability Enum**: Consider enum type or documented string values
- **Foreign Key Cascade**: ON DELETE SET NULL for canonical_part_id (if canonical part deleted, supplier part orphaned but preserved)

**Model Interface**:
- Import supplier data in bulk
- Track normalization and matching status
- Update canonical part linkage
- Query unmapped supplier parts for processing queue

**3. Fitments Table Design**

**Purpose**: Track which parts fit which vehicles with confidence levels

**Schema Requirements**:
- `id`: UUID primary key
- `canonical_part_id`: UUID foreign key to `parts.id` (which part)
- `vehicle_id`: UUID foreign key to `vehicles.id` (which vehicle)
- `confidence`: Float (0.0 to 1.0, FitmentAgent's certainty)
- `evidence`: JSONB (reasoning and data sources, e.g., `{"matched_attributes": ["engine", "position"], "sources": ["oem_catalog", "agent_reasoning"]}`)
- `source`: Text (how fitment determined, e.g., "agent", "manual_verification", "supplier_data")
- `created_at`: Timestamp

**Design Considerations**:
- **Confidence Thresholds**:
  - ≥0.90: "Guaranteed Fit" (display green badge)
  - 0.75-0.89: "Likely Fit" (display yellow badge, disclaimer)
  - <0.75: Low confidence (may not display, flag for review)
- **Evidence Structure**: Store reasoning for debugging and customer transparency
- **Composite Index**: `(canonical_part_id, vehicle_id)` for fast reverse fitment lookups
- **Uniqueness**: Consider unique constraint on `(canonical_part_id, vehicle_id)` to prevent duplicates
- **Deletion Cascade**: ON DELETE CASCADE for both FKs (if part or vehicle deleted, remove fitments)

**Model Interface**:
- Create fitments with validation
- Query fitments by part (reverse fitment table)
- Query fitments by vehicle (vehicle-aware browsing)
- Filter by confidence threshold
- Update confidence as agents improve

**Implementation Steps**

**Step 1: Create Parts Migration**
- Generate migration for `parts` table with schema above
- Add index on `category` for category page queries
- Add GIN index on `attributes` if using JSONB queries: `CREATE INDEX idx_parts_attributes ON parts USING GIN(attributes);`
- Test migration application

**Step 2: Create SupplierParts Migration**
- Generate migration for `supplier_parts` table
- Add foreign key: `canonical_part_id REFERENCES parts(id) ON DELETE SET NULL`
- Add unique constraint: `UNIQUE(supplier_id, supplier_sku)`
- Add index on `canonical_part_id` for join performance
- Add GIN indexes on `raw_data` and `normalized_data` for JSON queries

**Step 3: Create Fitments Migration**
- Generate migration for `fitments` table
- Add foreign keys:
  - `canonical_part_id REFERENCES parts(id) ON DELETE CASCADE`
  - `vehicle_id REFERENCES vehicles(id) ON DELETE CASCADE`
- Add unique constraint: `UNIQUE(canonical_part_id, vehicle_id)`
- Add composite index: `(vehicle_id, confidence)` for vehicle-aware browsing with confidence filtering
- Add check constraint: `confidence BETWEEN 0 AND 1`

**Step 4: Implement Part Model**
- Create `/backend/src/models/Part.ts`
- Define `Part` TypeScript interface
- Define category-specific attribute types (e.g., `BrakeRotorAttributes`)
- Implement functions:
  - `createPart(data: PartInput): Promise<Part>`
  - `getPartById(id: string): Promise<Part | null>`
  - `updatePart(id: string, updates: Partial<Part>): Promise<Part>`
  - `listPartsByCategory(category: string, filters?, pagination?): Promise<Part[]>`
  - `searchParts(query: string, vehicleId?: string): Promise<Part[]>` (for vehicle-aware search)
- Validate attributes match expected schema for category

**Step 5: Implement SupplierPart Model**
- Create `/backend/src/models/SupplierPart.ts`
- Define `SupplierPart` TypeScript interface
- Implement functions:
  - `createSupplierPart(raw: unknown): Promise<SupplierPart>` (import raw supplier data)
  - `getSupplierPartById(id: string): Promise<SupplierPart | null>`
  - `updateNormalizedData(id: string, normalizedData: object): Promise<void>`
  - `attachCanonicalPart(supplierPartId: string, canonicalPartId: string): Promise<void>`
  - `listUnmappedSupplierParts(limit?: number): Promise<SupplierPart[]>` (for processing queue)
  - `listSupplierPartsByCanonicalId(canonicalPartId: string): Promise<SupplierPart[]>` (price comparison)

**Step 6: Implement Fitment Model**
- Create `/backend/src/models/Fitment.ts`
- Define `Fitment` TypeScript interface
- Implement functions:
  - `createFitment(data: FitmentInput): Promise<Fitment>` (validate confidence 0-1)
  - `updateFitment(id: string, updates: Partial<Fitment>): Promise<Fitment>`
  - `listFitmentsForPart(partId: string, minConfidence?: number): Promise<Fitment[]>` (reverse fitment table)
  - `listFitmentsForVehicle(vehicleId: string, minConfidence?: number): Promise<Fitment[]>` (vehicle-aware browse)
  - `getFitmentForPartAndVehicle(partId: string, vehicleId: string): Promise<Fitment | null>` (specific lookup)
  - `deleteFitment(id: string): Promise<void>` (for corrections)

**Step 7: Write Comprehensive Tests**
- Create test files for each model
- **Part Tests**:
  - Create part with valid attributes
  - List parts by category with pagination
  - Update part description after SEO generation
  - Search parts by text query
- **SupplierPart Tests**:
  - Import raw supplier data
  - Update normalized data after agent processing
  - Attach to canonical part
  - List unmapped parts
  - Unique constraint enforcement
- **Fitment Tests**:
  - Create fitment with confidence
  - Confidence validation (reject <0 or >1)
  - Reverse fitment lookup
  - Vehicle-aware fitment filtering
  - Unique constraint (part+vehicle combination)

**Step 8: Document Data Patterns**
- Update `DOMAIN_MODEL.md` with:
  - Example Parts records for different categories
  - SupplierPart raw_data and normalized_data examples
  - Fitment evidence structure patterns
  - Confidence threshold meanings
- Document in code comments:
  - JSONB attribute patterns per category
  - Foreign key cascade behavior rationale
  - Indexing strategy for performance

**Acceptance Criteria**

**Parts Table:**
- [x] Migration creates table with correct schema
- [x] Index on `category` exists
- [x] GIN index on `attributes` exists for JSON queries
- [x] Can create, read, update parts via model
- [x] List by category with pagination works
- [x] Search across name/brand works
- [x] Attributes validated per category

**SupplierParts Table:**
- [x] Migration creates table with all columns
- [x] Unique constraint on `(supplier_id, supplier_sku)` enforced
- [x] Foreign key to parts with ON DELETE SET NULL works
- [x] Raw data preserved exactly as imported
- [x] Can update normalized_data independently
- [x] Can attach/detach canonical part link
- [x] List unmapped parts returns unprocessed records

**Fitments Table:**
- [x] Migration creates table with correct schema
- [x] Unique constraint on `(canonical_part_id, vehicle_id)` enforced
- [x] Foreign keys cascade delete appropriately
- [x] Confidence check constraint enforces 0-1 range
- [x] Composite index on `(vehicle_id, confidence)` exists
- [x] Can create fitment with evidence
- [x] Reverse fitment lookup returns all vehicles for part
- [x] Vehicle-aware query returns all parts for vehicle
- [x] Confidence filtering works

**General:**
- [x] All models strongly typed in TypeScript
- [x] CRUD operations work for all three models
- [x] Foreign key relationships enforced
- [x] Comprehensive unit tests pass
- [x] Can link SupplierPart → Part → Fitment → Vehicle in tests

**Files Created/Modified**

- `/backend/prisma/migrations/003_create_parts.sql`
- `/backend/prisma/migrations/004_create_supplier_parts.sql`
- `/backend/prisma/migrations/005_create_fitments.sql`
- `/backend/src/models/Part.ts` — Canonical part model
- `/backend/src/models/SupplierPart.ts` — Supplier data model
- `/backend/src/models/Fitment.ts` — Vehicle compatibility model
- `/backend/src/models/types.ts` — Shared interfaces (FitmentInput, PartAttributes, etc.)
- `/backend/tests/models/Part.test.ts`
- `/backend/tests/models/SupplierPart.test.ts`
- `/backend/tests/models/Fitment.test.ts`
- Update `DOMAIN_MODEL.md` — Entity examples and patterns

**Test Requirements**

1. **Part CRUD Tests**: Create, read, update, list, search
2. **Part Attributes Test**: Validate category-specific attributes structure
3. **SupplierPart Import Test**: Raw data preserved exactly
4. **SupplierPart Normalization Test**: Update normalized_data, verify raw unchanged
5. **SupplierPart Mapping Test**: Attach canonical part, verify link
6. **SupplierPart Uniqueness Test**: Duplicate supplier_id+SKU fails
7. **Fitment Creation Test**: Create fitment with evidence
8. **Fitment Confidence Test**: Invalid confidence rejected (< 0 or > 1)
9. **Fitment Uniqueness Test**: Duplicate part+vehicle fails
10. **Reverse Fitment Test**: List all vehicles for part, ordered by confidence
11. **Vehicle Fitment Test**: List all parts for vehicle above confidence threshold
12. **Cascade Delete Test**: Deleting part removes fitments
13. **Integration Test**: SupplierPart → Part → Fitment → Vehicle full flow

**Dependencies**

- Requires: Task 2.2.1 (Vehicles table) for fitments foreign key
- Requires: Task 2.1.1 (DB client) for database access
- Blocks: All Phase 4 agents (they operate on these entities)
- Blocks: Phase 5 frontend (displays these entities)

---

### 2.3 — Orders & Workflows Basic Schema

#### 2.3.1 — Orders & OrderLines

- [x] 🟡 **P1-HIGH** — Implement order schema

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

- [x] Orders and order lines can be created and retrieved in tests.
- [x] Foreign keys enforce valid relationships.

**Files**

- Migrations for `orders`, `order_lines`
- Models

**Tests**

- Test that creating an order with multiple lines persists correctly and sums the totals as expected.

**Why This Matters**: Orders are revenue transactions requiring price/fitment snapshots for audit, refunds, and quality analysis.

**Principles**: (1) State machine with valid transitions (pending→confirmed→shipped→delivered) (2) Price snapshotting at purchase time (3) Atomic transactions wrapping order+lines (4) Fitment confidence tracking per line (5) JSONB for flexible address storage (6) Proper FK cascades (order deletion cascades to lines; part deletion restricted)

**Acceptance Criteria**: Orders with status lifecycle, atomic creation with lines, price/fitment/vehicle snapshots stored, state transition validation, transaction rollback on error, tests cover full order flow

---

#### 2.3.2 — Workflows & AgentEvents

- [x] 🔴 **P0-CRITICAL** — Implement workflow + agent event logging schema

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

- [x] Ability to create workflows and associated AgentEvents.
- [x] Reasoning text is stored reliably for embedding generation later.

**Files**

- Migrations
- Model files

**Tests**

- Test a simple workflow creation and logging of at least one AgentEvent.

**Why This Matters**: Workflows orchestrate multi-agent processes; AgentEvents provide complete audit trail, enable vector memory, and support evaluation/debugging.

**Principles**: (1) Workflow states with context accumulation (pending→running→completed/failed) (2) Context JSONB accumulates progress, enables resume (3) AgentEvent logging captures input/output/reasoning for every decision (4) Nullable workflow_id allows ad-hoc events (5) Reasoning quality critical for embeddings (6) Graceful logging (failures shouldn't crash workflows) (7) Proper indexing for queries

**Acceptance Criteria**: Workflows with state transitions and context accumulation, AgentEvents with complete I/O capture and detailed reasoning, FTS index on reasoning, nullable workflow link works, tests cover workflow lifecycle and event logging

---

## PHASE 3 — Task Queue, Orchestrator, and LLM Router (MVP)

**Goal:** Implement functional task queue, Orchestrator skeleton, and LLM Router with stubbed models/routes.

---

### 3.1 — Task Queue Implementation

#### 3.1.1 — `tasks` table & leasing logic

- [x] 🔴 **P0-CRITICAL** — Implement queue schema and leasing

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
- [x] Only one worker gets a lease on a given task at a time.

**Files**

- Migration for `tasks`
- `/backend/src/queue/TaskQueue.ts`

**Tests**

- Unit tests that:
  - Enqueue tasks with different priorities.
  - Lease tasks from multiple workers; no duplicates.
  - Confirm backoff scheduling.
  - Confirm tasks become `dead` after final failure.

**Why This Matters**: Task queue enables distributed agent execution, graceful failure handling, and priority-based processing. Proper leasing prevents duplicate work; backoff prevents thundering herd.

**Principles**: (1) Leasing with `FOR UPDATE SKIP LOCKED` prevents duplicate processing (2) Priority-based ordering (lower int = higher priority) (3) Exponential backoff on failures (attempts² × base_delay) (4) Status lifecycle (pending→leased→running→completed/failed/dead) (5) Max attempts before dead-letter (6) available_at for scheduled execution (7) Lease expiration and renewal (8) Error info capture for debugging

**Acceptance Criteria**: Tasks enqueued with priority/workflow link, lease prevents duplicates across workers, backoff calculation correct, dead after max attempts, lease expiration and renewal work, tests verify concurrency safety

---

#### 3.1.2 - Worker loop abstraction

- [x] 🔴 **P0-CRITICAL** — Build worker framework

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

**Why This Matters**: Worker abstraction enables multiple agent types to share queue infrastructure. Proper lifecycle management prevents lost work during deploys/crashes.

**Principles**: (1) Generic worker framework reusable across agents (2) Lease renewal for long-running tasks (3) Mark running before execution (visibility) (4) Complete or fail atomically (5) Graceful shutdown on signals (6) Configurable sleep/poll interval (7) Handler signature consistency (8) Error handling doesn't crash worker (9) Logging for observability

**Acceptance Criteria**: Worker processes tasks from queue, updates status correctly, handles task success/failure, renews leases for long tasks, graceful shutdown on SIGTERM/SIGINT, configurable via agent name or handler map, tests verify task lifecycle

---

### 3.2 — Orchestrator MVP

#### 3.2.1 - Orchestrator module & workflow registry

- [x] 🔴 **P0-CRITICAL** - Implement orchestrator core

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

**Why This Matters**: Orchestrator coordinates multi-step business processes across agents, ensuring workflows complete even with failures/retries.

**Principles**: (1) Workflow registry defines types and task sequences (2) startWorkflow creates initial tasks (3) handleTaskResult decides next tasks (4) State transitions atomic with context updates (5) Use queue for task scheduling (never direct agent calls) (6) Log decisions in AgentEvents (7) Support workflow resume after failure (8) Context accumulates progress (9) Simple state machine (pending→running→completed/failed)

**Acceptance Criteria**: Orchestrator starts workflows and creates tasks, handles task results and transitions state, registry defines workflow configs, uses queue for task emission, logs decisions, dummy workflow completes end-to-end, tests verify state transitions

---

### 3.3 — LLM Router MVP

#### 3.3.1 — Router core + provider adapters

- [x] 🔴 **P0-CRITICAL** — Implement LLM Router skeleton

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

**Why This Matters**: LLM Router abstracts provider differences, optimizes cost/performance per task type, and enables fallback/retry strategies.

**Principles**: (1) TaskType-based routing (meta_reasoning→GPT-4, lightweight→GPT-3.5, etc.) (2) Provider abstraction (OpenAI, Anthropic, local) (3) Unified response format (output, reasoning, model, tokens, cost) (4) Error handling with retry/fallback (5) Cost tracking per request (6) Mockable providers for testing (7) Configuration-driven routing (8) Schema validation on responses

**Acceptance Criteria**: Router routes by TaskType, returns normalized response, all providers mockable, error handling with fallback, cost estimation included, routing logged, tests verify routing decisions and fallback behavior

---

## PHASE 4 — Agents & Workflows (Core Business Logic)

**Goal:** Implement core agents and key workflows: supplier ingestion, part publication, and initial fitment/pricing/content flows.

---

### 4.1 — Core Agents Implementation

#### 4.1.1 — Supplier Normalization Agent

- [x] 🔴 **P0-CRITICAL** — Implement SupplierNormalizationAgent

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

**Why This Matters**: Normalization transforms inconsistent supplier data into structured attributes for matching and fitment analysis.

**Principles**: (1) Map raw supplier fields to standard attributes (2) Use LLM Router with TaskType=normalization for ambiguous cases (3) Write to normalized_data (preserve raw_data) (4) Log AgentEvent with reasoning (5) Handle missing/invalid data gracefully (6) Extract: category, position, brand, dimensions, material (7) Flag quality issues for review

**Acceptance Criteria**: Agent reads raw_data, produces structured normalized_data, uses LLM when needed, logs complete AgentEvent with reasoning, handles edge cases, tests verify normalization accuracy

---

#### 4.1.2 — Product Data Agent

- [x] 🔴 **P0-CRITICAL** — Implement ProductDataAgent

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

**Why This Matters**: ProductData Agent deduplicates supplier parts into canonical parts, enabling unified product catalog and price comparison.

**Principles**: (1) Match normalized supplier parts to existing canonical parts (2) Create new canonical part if no match (3) Use similarity scoring (category+brand+attributes) (4) Set canonical_part_id on supplier part (5) Update/enrich canonical attributes (6) Log matching decision with confidence (7) Avoid duplicate canonical parts (8) Use vector similarity when available (future)

**Acceptance Criteria**: Agent links supplier parts to canonical parts, creates new parts when needed, no obvious duplicates created, matching logged with reasoning, tests verify convergence of similar parts

---

#### 4.1.3 — Fitment Agent (MVP)

- [x] 🔴 **P0-CRITICAL** — Implement FitmentAgent core

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

**Why This Matters**: Fitment Agent determines vehicle compatibility with confidence scores, powering "will this fit my car?" functionality.

**Principles**: (1) Match part attributes to vehicle specs (engine, position, year range) (2) Use LLM Router TaskType=fitment_analysis for ambiguous cases (3) Generate confidence score 0-1 (4) Create evidence JSONB with reasoning (5) Confidence thresholds: ≥0.90=guaranteed, 0.75-0.89=likely, <0.75=uncertain (6) Write fitments table with confidence/evidence/source (7) Handle missing vehicle/part data gracefully

**Acceptance Criteria**: Agent creates fitments with valid confidence scores, evidence captures reasoning, thresholds applied correctly, LLM used for ambiguous cases, tests verify known fit/no-fit scenarios

---

#### 4.1.4 — Pricing Agent (MVP)

- [x] 🟡 **P1-HIGH** — Implement PricingAgent

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

**Why This Matters**: Pricing Agent computes competitive prices balancing margin requirements and supplier costs.

**Principles**: (1) Choose best supplier (cheapest cost for MVP) (2) Apply margin rules: price = cost × (1 + margin) (3) Enforce min margin threshold (4) Optional max markup cap (5) Store pricing metadata (supplier chosen, margin applied) (6) Use TaskType=pricing_reasoning for complex decisions (7) Handle multi-supplier scenarios (8) Log pricing decision with reasoning

**Acceptance Criteria**: Agent computes prices never below cost+min margin, chooses supplier correctly, logs pricing decisions, margin rules enforced, tests verify pricing calculations

---

#### 4.1.5 — SEO/Content Agent (MVP)

- [x] 🟡 **P1-HIGH** — Implement SEOAgent

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

**Why This Matters**: SEO Agent generates product descriptions following brand voice and safety policies, improving discoverability and conversions.

**Principles**: (1) Use LLM Router TaskType=seo_generation (2) Include brand voice from VOICE_TONE_GUIDE.md in prompt (3) Follow SUPPORT_POLICY.md restrictions (no unverified OEM claims, no lifetime guarantees) (4) Include attributes, category, fitment summary (5) Limit length (token budget) (6) Plain text with optional sections (Features, Fitment) (7) Store in parts.description (8) Log generation with reasoning

**Acceptance Criteria**: Agent generates descriptions following brand voice, no forbidden claims present, attributes mentioned appropriately, length limited, tests verify safety policy compliance

---

### 4.2 — Key Workflows

#### 4.2.1 — `wf_ingest_supplier_catalog`

 - [x] 🔴 **P0-CRITICAL** — Implement supplier ingestion workflow

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

**Why This Matters**: Ingestion workflow orchestrates end-to-end supplier catalog processing through all agents.

**Principles**: (1) Workflow type: wf_ingest_supplier_catalog (2) Steps: load feed → create supplier_parts → normalize → match canonical → generate fitments → calculate pricing → generate SEO (3) Enqueue tasks for each step (4) Track progress in workflow context (5) Handle partial failures gracefully (6) Mark workflow completed when all tasks done (7) Log metrics (parts processed, errors)

**Acceptance Criteria**: Workflow creates supplier_parts from feed, enqueues normalization tasks, chains through all agent steps, produces canonical parts with fitments/pricing/descriptions, workflow state tracks progress, tests verify end-to-end flow

---

#### 4.2.2 — `wf_publish_new_part`

 - [x] 🟡 **P1-HIGH** — Implement part publication workflow

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

**Why This Matters**: Publication workflow finalizes new parts by ensuring fitments, pricing, and content are complete before customer visibility.

**Principles**: (1) Workflow type: wf_publish_new_part (2) Input: canonical_part_id (3) Enqueue parallel tasks: FitmentAgent, PricingAgent, SEOAgent (4) Wait for all three to complete (5) Mark part as ready_to_publish flag (6) Track status in workflow context (7) Handle agent failures (retry or manual review)

**Acceptance Criteria**: Workflow enqueues three agent tasks, monitors completion, marks part ready when done, handles task failures, tests verify all agents invoked and part flagged correctly

---

## PHASE 5 — Frontend UX (MVP) & Support Agent Integration

**Goal:** Implement the main customer-facing flows and basic AI Support integration.

---

### 5.1 — Vehicle Picker & Garage

#### 5.1.1 - VehiclePicker + GarageDropdown components

- [x] 🔴 **P0-CRITICAL** - Implement core vehicle selection UX

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

**Why This Matters**: Vehicle selection is core UX flow - everything in AutoMechanica is vehicle-aware. Garage persistence ensures seamless experience across sessions.

**Principles**: (1) Year/Make/Model/Trim/Engine cascade selection (2) Populate dropdowns from backend /vehicles endpoint or static data (3) Store active vehicle in localStorage for persistence (4) GarageDropdown in header shows active vehicle (5) Allow switching between saved vehicles (6) Empty state prompts selection (7) Brand styling from BRAND_GUIDE.md (8) Responsive design

**Acceptance Criteria**: User selects vehicle via cascading dropdowns, selection persists across reloads (localStorage), header displays active vehicle, empty state handled, garage dropdown allows switching, components styled per brand guide, tests verify selection and persistence

---

### 5.2 — Product List & Detail Pages

#### 5.2.1 - Vehicle-aware category page

- [x] 🔴 **P0-CRITICAL** - Implement vehicle-aware category browse

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

**Why This Matters**: Vehicle-aware browsing shows only compatible parts, reducing customer confusion and returns.

**Principles**: (1) Route: /vehicles/:year/:make/:model/:category or similar (2) Read active vehicle from context/localStorage (3) API call filters by vehicleId when available (4) No vehicle: prompt to select + show generic list (5) ProductCard displays: name, price, fitment badge (6) Pagination and filters (position, brand, price range) (7) Empty state handling (8) Loading states

**Acceptance Criteria**: Category page filters by active vehicle, shows fitment badges, no vehicle shows prompt, pagination works, filters functional, loading/empty states, tests verify with/without vehicle scenarios

---

#### 5.2.2 - ProductDetail with FitmentBadge & reverse fitment table

- [x] 🔴 **P0-CRITICAL** - Implement product detail UX

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

**Why This Matters**: Product detail provides complete fitment transparency, building customer confidence in compatibility.

**Principles**: (1) Route: /parts/:partId (2) Fetch: GET /parts/:id from API_REFERENCE.md (3) Sections: Title, Price, Add-to-cart, FitmentBadge, SpecsTable, ReverseFitmentTable, Description (4) FitmentBadge maps confidence: ≥0.90=Guaranteed (green), 0.75-0.89=Likely (yellow), <0.75=Verify (gray) (5) ReverseFitmentTable lists all vehicles part fits (6) Highlight active vehicle row (7) Specs from parts.attributes (8) Description from parts.description

**Acceptance Criteria**: Detail page displays all sections, fitment badge reflects confidence correctly, reverse fitment table shown, active vehicle highlighted, specs table formatted, description rendered, add-to-cart functional, tests verify badge logic

---

### 5.3 — Support Agent Integration

#### 5.3.1 - SupportChatEntry and backend `/support/message` wiring

- [x] 🟡 **P1-HIGH** - Implement basic support chat entry point

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

**Why This Matters**: Support chat provides context-aware assistance, improving conversion and reducing support tickets.

**Principles**: (1) Backend: POST /support/message with {message, vehicleId?, partId?} (2) SupportAgent uses LLM Router TaskType=support_reply (3) Attach vehicle+part context to prompt (4) Follow SUPPORT_POLICY.md and VOICE_TONE_GUIDE.md (5) Frontend: SupportChatEntry component (6) Button on product/checkout pages (7) Modal/panel with conversation log (8) Pre-fill context (current part/vehicle) (9) Display responses with confidence

**Acceptance Criteria**: Backend endpoint receives message and context, calls SupportAgent, returns reply, frontend chat component sends requests, displays responses, pre-fills context, follows brand voice, tests verify context passing and response handling

---

## PHASE 6 — Evaluation, Admin Tools, and Polishing

**Goal:** Add evaluation harnesses, admin APIs, and CI to keep quality high over time.

---

### 6.1 — Evaluation Harnesses

#### 6.1.1 — Fitment gold dataset harness

- [x] 🟡 **P1-HIGH** — Implement fitment evaluation harness

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

**Why This Matters**: Gold dataset validates FitmentAgent accuracy against known correct answers, enabling continuous improvement.

**Principles**: (1) Store gold dataset in /backend/tests/fixtures/fitment_gold.json (2) Format: [{vehicle, part, expected_fit, notes}] per EVALUATION_FRAMEWORK.md (3) Harness runs FitmentAgent on each scenario (4) Compare predicted fit vs expected (5) Calculate metrics: accuracy, false positives, false negatives (6) Log summary (7) Runnable via npm test (8) Expand dataset over time

**Acceptance Criteria**: Gold dataset exists with known scenarios, harness runs FitmentAgent, compares predictions, calculates accuracy metrics, prints summary, runnable in CI, tests verify harness execution

---

### 6.2 — Admin API & Basic UI (Queue/Workflows)

#### 6.2.1 — Admin endpoints for workflows & tasks

- [x] 🟢 **P2-MEDIUM** — Implement admin monitoring API

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

**Why This Matters**: Admin API enables operational visibility and manual intervention for stuck workflows/tasks.

**Principles**: (1) Endpoints: GET /admin/workflows, GET /admin/workflows/:id, POST /admin/workflows/:id/retry, GET /admin/tasks, POST /admin/tasks/:id/requeue (2) Admin authentication (shared secret or env gate for MVP) (3) Return structured workflow/task data (4) Requeue resets attempts and status (5) Retry failed workflows (6) Query by state/type filters (7) Pagination for large result sets

**Acceptance Criteria**: Admin endpoints respond with correct data, requeue moves tasks from dead to pending, retry restarts failed workflows, authentication enforced, tests cover listing and operations

---

### 6.3 — Deployment & CI

#### 6.3.1 — Basic CI pipeline

- [x] 🟡 **P1-HIGH** — Setup CI for tests and lint

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

**Why This Matters**: CI ensures code quality before merge, preventing broken code from reaching production.

**Principles**: (1) Use GitHub Actions or similar (2) Trigger on push/PR (3) Jobs: lint, typecheck, backend tests, frontend tests (4) Install dependencies with caching (5) Run all quality checks (6) Fail build if any check fails (7) Upload coverage reports (8) Parallel job execution

**Acceptance Criteria**: CI workflow configured, runs on push/PR, all checks execute, failures block merge, dependency caching works, tests verify CI triggers correctly

---

## PHASE 7 — NICE-TO-HAVE IMPROVEMENTS (OPTIONAL)

These tasks can be done after a working MVP exists.

---

### 7.1 — Vector Memory Optimization

#### 7.1.1 — Qdrant adapter (future)

- [x] 🟢 **P3-LOW** — Prepare Qdrant memory adapter

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

**Why This Matters**: Qdrant offers superior performance for large-scale vector search (millions of embeddings).

**Principles**: (1) Create MemoryBackend interface (2) Implement PgvectorMemoryBackend (3) Implement QdrantMemoryBackend (4) Config selects backend at runtime (5) Feature flag for A/B testing (6) Migration path from pgvector to Qdrant

**Acceptance Criteria**: Interface defined, both backends implement interface, config switches backend, tests verify both backends work

---

### 7.2 — Analytics Dashboards

#### 7.2.1 — Basic analytics endpoints

- [x] 🟢 **P3-LOW** — Add metrics endpoints

**Description**  
Add endpoints to expose aggregated metrics for admin dashboards (queue depth, error rates, fitment accuracy).

**Why This Matters**: Observability enables data-driven improvements and operational monitoring.

**Principles**: (1) Endpoint: GET /admin/metrics (2) Aggregate from evaluation_metrics, tasks, agent_events (3) Metrics: task queue depth, error rates, agent performance, fitment accuracy trends (4) Time range filters (5) JSON response for dashboard consumption

**Acceptance Criteria**: Metrics endpoint returns aggregated data, queryable by time range, tests verify calculations

---

## PHASE 8 — PRODUCTION READINESS & LAUNCH

**Goal:** Ensure system is production-ready with monitoring, operational runbooks, and launch validation.

**Phase Success Criteria:**
- ✅ Comprehensive monitoring and alerting configured
- ✅ Security hardening complete (HTTPS, rate limiting, input validation)
- ✅ Operational runbooks documented and tested
- ✅ Performance targets validated via load testing
- ✅ End-to-end smoke tests pass in production environment
- ✅ Incident response procedures established

---

### 8.1 — Monitoring & Observability

#### 8.1.1 — Application monitoring setup

- [x] 🟡 **P1-HIGH** — Implement structured logging and metrics

**Description**
Set up comprehensive logging, metrics collection, and error tracking for production operations.

**Why This Matters**: Production issues require fast diagnosis. Structured logging and metrics enable quick troubleshooting and proactive alerting.

**Principles**: (1) Structured logging with Winston/Pino (JSON format) (2) Log levels: error, warn, info, debug (3) Request ID tracking across services (4) Error tracking with Sentry or similar (5) Metrics: response times, queue depth, agent latency, error rates (6) Health endpoints with dependencies (7) Graceful degradation logging

**Acceptance Criteria**: Structured logs output in JSON, request IDs tracked across services, errors sent to tracking service, metrics exposed for Prometheus/similar, health endpoint includes all dependency checks, tests verify logging and metrics collection

---

#### 8.1.2 — Database performance monitoring

- [x] 🟡 **P1-HIGH** — Setup query performance tracking

**Description**
Monitor database performance with slow query logging and connection pool metrics.

**Principles**: (1) Enable slow query logging (>1s threshold) (2) Monitor connection pool utilization (3) Track query counts by type (4) Index usage monitoring (5) Alert on connection pool exhaustion (6) Regular EXPLAIN ANALYZE for critical queries

**Acceptance Criteria**: Slow queries logged and alerting configured, connection pool metrics tracked and visualized, query performance baseline established, alerts configured for pool exhaustion

---

### 8.2 — Security Hardening

#### 8.2.1 — Production security checklist

- [X] 🔴 **P0-CRITICAL** — Complete security audit

**Description**
Validate all security requirements before launch.

**Principles**: (1) HTTPS enforced everywhere (2) API rate limiting per IP/user (3) SQL injection prevention via parameterized queries (4) XSS prevention with Content Security Policy (5) CORS properly configured (6) Secrets in environment variables only (7) Input validation on all endpoints (8) Authentication/authorization on admin endpoints (9) Dependency vulnerability scan with npm audit

**Acceptance Criteria**: All security checks passed, HTTPS enforced in production, rate limiting active, CSP headers configured, input validation comprehensive, admin endpoints authenticated, dependency vulnerabilities resolved, security scan clean

---

### 8.3 — Operational Runbooks

#### 8.3.1 — Create incident response procedures

- [x] 🟡 **P1-HIGH** — Document operational procedures

**Description**
Create runbooks for common operational scenarios and incidents.

**Principles**: Document procedures for: (1) Database connection failures (2) Task queue backed up (3) Agent failures and retries (4) High error rates investigation (5) Slow performance diagnosis (6) Deployment rollback (7) Data corruption recovery (8) Emergency contacts and escalation

**Acceptance Criteria**: Runbooks documented in /docs/OPERATIONS.md, team trained on procedures, runbooks tested in staging environment, emergency contacts documented, escalation paths defined

---

### 8.4 — Launch Validation

#### 8.4.1 — End-to-end smoke tests

- [x] 🔴 **P0-CRITICAL** — Production smoke test suite

**Description**
Validate critical user flows work correctly in production environment.

**Principles**: Test flows: (1) User selects vehicle and persists (2) Browses category filtered by vehicle (3) Views product detail with fitment badge (4) Adds to cart (5) Completes checkout (6) Support chat responds with context (7) Supplier ingestion workflow completes (8) Part publication workflow completes

**Acceptance Criteria**: All smoke tests pass in staging, tests executable against production with feature flags, critical user flows validated, admin workflows tested, smoke tests run post-deployment

---

#### 8.4.2 — Performance validation

- [x] 🟡 **P1-HIGH** — Load testing and optimization

**Description**
Validate system meets performance targets from MAIN_PLAN.md Section 7.4.

**Principles**: Validate: (1) API response times <200ms p95 (2) Page load times <2s (3) Concurrent user capacity (100+ simultaneous) (4) Database query performance (<100ms for common queries) (5) Worker throughput (tasks/minute) (6) LLM latency budgets

**Acceptance Criteria**: Load tests executed with realistic traffic patterns, performance targets met or exceeded, bottlenecks identified and resolved, database queries optimized, caching strategy validated, results documented

---

## 8. Definition of Done (DoD) for MVP

MVP is considered **DONE** when:

- All **P0** tasks in Phases 1–5 are completed.
- All **P0** tasks in Phase 8 (Security & Smoke Tests) are completed.
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
- System deployed to production with monitoring and alerting.
- Security checklist complete and validated.
- Smoke tests pass in production environment.
- Performance targets met under load testing.
- Operational runbooks documented and team trained.

At that point, AutoMechanica is a functioning, production-ready, end-to-end, AI-assisted car parts platform.

---

# End of PROJECT_TODO.md
