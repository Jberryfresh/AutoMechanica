# AGENTS.md

# Guide for AI Coding Agents Building AutoMechanica

**Purpose:** This document provides comprehensive guidance for AI coding assistants (GitHub Copilot, Codex, Claude, or similar) that are helping to build the AutoMechanica platform. This is NOT about the in-product AI agents (FitmentAgent, SEOAgent, etc.)—this is about YOU, the AI assistant reading this file.

---

## 1. Your Role and Responsibilities

### 1.1 What You Are Building

You are helping build **AutoMechanica**, a fully autonomous, AI-driven car parts dropshipping platform. The system:

- Ingests supplier catalogs (CSVs, APIs)
- Normalizes and cleans part data
- Creates canonical part records
- Maps fitment (which parts fit which vehicles)
- Computes pricing with margin rules
- Generates SEO-friendly product descriptions
- Publishes products to a storefront
- Provides AI-powered customer support

### 1.2 Your Primary Directive

**Build a production-quality, maintainable, well-tested system that another AI agent or human developer can extend without confusion.**

Every piece of code you write should be:
- **Self-documenting**: Clear naming, JSDoc comments, TypeScript types
- **Testable**: Unit tests, integration tests, acceptance criteria met
- **Consistent**: Following established patterns in this codebase
- **Traceable**: Linked back to spec docs and task IDs

---

## 2. Before You Write Any Code

### 2.1 Mandatory Pre-Flight Checklist

Before implementing ANY task, you MUST:

1. **Read the relevant spec documents** listed below
2. **Understand the current project state** (check `PROJECT_TODO.md` for status)
3. **Identify dependencies** (what must exist before this task can work?)
4. **Confirm you're not contradicting existing architecture**
5. **Plan your tests** before writing implementation code

### 2.2 Master Document Hierarchy

Read these documents in order of importance for context:

| Priority | Document | Purpose |
|----------|----------|---------|
| 🔴 CRITICAL | `MAIN_PLAN.md` | Vision, architecture, MVP scope, success criteria |
| 🔴 CRITICAL | `PROJECT_TODO.md` | Exact task sequence, acceptance criteria, metadata |
| 🔴 CRITICAL | `DOMAIN_MODEL.md` | Database schema, entities, relationships |
| 🔴 CRITICAL | `ARCHITECTURE_OVERVIEW.md` | System layers, module boundaries, data flow |
| 🟡 HIGH | `CODE_STYLE_AND_CONVENTIONS.md` | Formatting, naming, patterns |
| 🟡 HIGH | `AGENTS_AND_WORKFLOWS.md` | In-product agent design (when building agents) |
| 🟡 HIGH | `LLM_ROUTER_SPEC.md` | Multi-model routing logic |
| 🟡 HIGH | `TASK_QUEUE_SPEC.md` | Queue implementation details |
| 🟡 HIGH | `VECTOR_MEMORY_DESIGN.md` | Embedding storage and retrieval |
| 🟢 MEDIUM | `EVALUATION_FRAMEWORK.md` | Testing harnesses, gold datasets |
| 🟢 MEDIUM | `API_REFERENCE.md` | Endpoint contracts |
| 🟢 MEDIUM | `FRONTEND_UX_SPEC.md` | UI/UX requirements |
| 🟢 MEDIUM | `BRAND_GUIDE.md` | Visual identity, colors, typography |
| 🟢 MEDIUM | `VOICE_TONE_GUIDE.md` | Copy and messaging style |
| 🔵 LOW | `SUPPORT_POLICY.md` | Customer support agent safety rules |
| 🔵 LOW | `ENV_SETUP_GUIDE.md` | Environment variables, local setup |
| 🔵 LOW | `INSTALLATION.md` | Setup instructions |
| 🔵 LOW | `DEPLOYMENT.md` | Production deployment guide |

### 2.3 Conflict Resolution

If you encounter conflicting information:

1. **Spec docs win over TODO**: If `DOMAIN_MODEL.md` says a field is `TEXT` but `PROJECT_TODO.md` says `VARCHAR`, use `TEXT`.
2. **Newer context wins**: If the human provides updated requirements in conversation, those override older doc content.
3. **Ask if unclear**: If a conflict is significant, pause and ask for clarification rather than guessing.

---

## 3. Code Quality Standards

### 3.1 TypeScript Requirements

```typescript
// ✅ DO: Strong typing everywhere
interface CreateVehicleInput {
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
}

async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  // Implementation
}

// ❌ DON'T: Use `any` unless absolutely necessary
function processData(data: any): any { } // AVOID THIS
```

**Strict Mode Required:**
- `"strict": true` in tsconfig.json
- No implicit `any`
- Null checks enforced
- All function parameters and returns typed

### 3.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files (components) | PascalCase | `VehicleSelector.tsx` |
| Files (utilities) | camelCase | `formatCurrency.ts` |
| Files (models) | PascalCase | `Vehicle.ts` |
| Interfaces | PascalCase, prefix with I only if needed | `Vehicle`, `CreateVehicleInput` |
| Types | PascalCase | `FitmentConfidence` |
| Functions | camelCase, verb-first | `createVehicle`, `findPartById` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Database tables | snake_case, plural | `vehicles`, `supplier_parts` |
| Database columns | snake_case | `canonical_part_id`, `created_at` |
| API endpoints | kebab-case | `/api/vehicles`, `/api/supplier-parts` |

### 3.3 File Organization

```
/backend
  /src
    /api              # Express route handlers
      /routes         # Route definitions
      /middleware     # Auth, validation, error handling
    /models           # Database models and types
    /db               # Database client, migrations
    /agents           # In-product AI agents (FitmentAgent, etc.)
    /orchestrator     # Workflow orchestration
    /workflows        # Workflow definitions
    /queue            # Task queue implementation
    /llm              # LLM Router and providers
      /providers      # OpenAI, Anthropic, Local adapters
    /memory           # Vector memory module
    /services         # Business logic services
    /utils            # Shared utilities
    /types            # Shared TypeScript types
    /config           # Configuration loading
    index.ts          # Application entry point
  /tests
    /unit             # Unit tests mirroring src structure
    /integration      # Integration tests
    /fixtures         # Test data
  /prisma             # Prisma schema and migrations (if using Prisma)
```

### 3.4 Error Handling Patterns

```typescript
// ✅ DO: Use custom error classes
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(public field: string, public reason: string) {
    super(`Validation failed for ${field}: ${reason}`);
    this.name = 'ValidationError';
  }
}

// ✅ DO: Handle errors explicitly
async function getVehicle(id: string): Promise<Vehicle> {
  const vehicle = await db.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    throw new NotFoundError('Vehicle', id);
  }
  return vehicle;
}

// ✅ DO: Log errors with context
try {
  await processSupplierFeed(feedId);
} catch (error) {
  logger.error('Failed to process supplier feed', {
    feedId,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  throw error;
}
```

### 3.5 API Response Format

All API responses must follow this structure:

```typescript
// Success response
{
  "success": true,
  "data": { /* actual payload */ },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Year must be between 1900 and current year",
    "field": "year"
  }
}
```

---

## 4. Testing Requirements

### 4.1 Test-First Mindset

**Write tests BEFORE or ALONGSIDE implementation, not after.**

For every task in `PROJECT_TODO.md`, there is a "Tests" section. Those tests are REQUIRED, not optional.

### 4.2 Test Structure

```typescript
// Use descriptive test names
describe('VehicleModel', () => {
  describe('createVehicle', () => {
    it('should create a vehicle with all required fields', async () => {
      // Arrange
      const input = {
        year: 2020,
        make: 'Toyota',
        model: 'Camry',
        trim: 'SE',
        engine: '2.5L I4',
      };

      // Act
      const vehicle = await createVehicle(input);

      // Assert
      expect(vehicle.id).toBeDefined();
      expect(vehicle.year).toBe(2020);
      expect(vehicle.make).toBe('Toyota');
    });

    it('should enforce unique constraint on year/make/model/trim/engine', async () => {
      // Arrange
      const input = { year: 2020, make: 'Toyota', model: 'Camry', trim: 'SE', engine: '2.5L I4' };
      await createVehicle(input);

      // Act & Assert
      await expect(createVehicle(input)).rejects.toThrow(/unique/i);
    });

    it('should reject invalid year values', async () => {
      const input = { year: 1800, make: 'Toyota', model: 'Camry', trim: 'SE', engine: '2.5L I4' };
      await expect(createVehicle(input)).rejects.toThrow(ValidationError);
    });
  });
});
```

### 4.3 Test Coverage Requirements

| Component Type | Minimum Coverage | Focus Areas |
|----------------|------------------|-------------|
| Models | 90% | CRUD operations, constraints, edge cases |
| API Routes | 85% | Request validation, response format, error handling |
| Agents | 80% | Core logic, LLM interaction mocks, error recovery |
| Queue/Worker | 85% | Leasing, retries, dead-letter handling |
| Utilities | 95% | Pure functions should be fully tested |

### 4.4 Mocking External Services

Always mock external services (LLM providers, external APIs):

```typescript
// ✅ DO: Mock LLM Router in tests
jest.mock('../llm/router', () => ({
  routeLLM: jest.fn().mockResolvedValue({
    output: { fits: true, confidence: 0.92 },
    reasoning: 'Based on part dimensions and vehicle specs...',
    modelUsed: 'gpt-4o',
    tokens: 450,
  }),
}));

// ✅ DO: Use test fixtures
import { mockSupplierPart, mockVehicle } from '../fixtures';
```

---

## 5. Working with PROJECT_TODO.md

### 5.1 Task Execution Protocol

When implementing a task from `PROJECT_TODO.md`:

1. **Locate the task** by its ID (e.g., "2.2.1 — Vehicles table & model")
2. **Read the full task block**, including:
   - Priority emoji
   - Description
   - Implementation Notes for Codex
   - Acceptance Criteria
   - Files to create/update
   - Tests expected
3. **Check dependencies**: Does this task require earlier tasks to be complete?
4. **Implement exactly as specified**: Don't add unrequested features
5. **Update the checkbox** when complete: `- [ ]` → `- [✓]`
6. **Fill in Metadata** if tracking is desired

### 5.2 Acceptance Criteria are Non-Negotiable

Every task has Acceptance Criteria. Your implementation is NOT complete until:

- All acceptance criteria are demonstrably met
- All specified tests pass
- The code follows style guidelines
- No TypeScript errors or warnings

### 5.3 Branch and PR Naming

When the task specifies a branch name, use it:

```
feature/phase1-repo-structure
feature/phase1-backend-scaffold
feature/phase2-vehicles-model
```

Commit messages should reference the task:

```
feat(vehicles): implement vehicles table and model

- Add migration for vehicles table with unique constraint
- Implement createVehicle, findVehicleById, findOrCreateByKey
- Add unit tests for CRUD operations

Task: 2.2.1
```

---

## 6. Database and Schema Guidelines

### 6.1 Migration Discipline

- **Never edit existing migrations** once they've been applied
- **Create new migrations** for schema changes
- **Test migrations both ways** (up and down)
- **Document breaking changes** in migration comments

### 6.2 Schema Patterns

```sql
-- Standard table pattern
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT NOT NULL,
  engine TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (year, make, model, trim, engine)
);

-- Foreign key pattern
CREATE TABLE fitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  evidence JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_fitments_vehicle_id ON fitments(vehicle_id);
CREATE INDEX idx_fitments_canonical_part_id ON fitments(canonical_part_id);
```

### 6.3 JSONB Usage

Use JSONB for:
- Flexible attributes that vary by part type
- Evidence/reasoning storage
- Raw supplier data
- Configuration objects

```typescript
// Example: Part attributes as JSONB
interface PartAttributes {
  position?: 'front' | 'rear' | 'left' | 'right';
  material?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'mm' | 'in';
  };
  specifications?: Record<string, string | number>;
}
```

---

## 7. Agent Development (In-Product Agents)

When building the in-product AI agents (FitmentAgent, SEOAgent, etc.), follow these patterns:

### 7.1 Agent Interface

Every agent must implement:

```typescript
interface Agent {
  name: string;
  taskTypes: string[];
  
  runTask(task: QueuedTask): Promise<AgentResult>;
}

interface AgentResult {
  success: boolean;
  output: unknown;
  reasoning: string;
  shouldRetry?: boolean;
  error?: string;
}
```

### 7.2 Agent Event Logging

Every agent action must be logged to `agent_events`:

```typescript
await logAgentEvent({
  workflowId: task.workflowId,
  agentName: 'FitmentAgent',
  taskType: 'analyze_fitment',
  inputData: {
    partId: task.payload.partId,
    vehicleCandidates: task.payload.vehicleIds,
  },
  outputData: {
    fitments: createdFitments.map(f => ({
      vehicleId: f.vehicleId,
      confidence: f.confidence,
    })),
  },
  reasoning: 'Matched based on brake rotor diameter and bolt pattern...',
});
```

### 7.3 LLM Router Integration

Agents should use the LLM Router, not direct API calls:

```typescript
// ✅ DO: Use router with correct TaskType
const result = await routeLLM('fitment_analysis', {
  part: partData,
  vehicle: vehicleData,
  prompt: 'Analyze whether this part fits this vehicle...',
});

// ❌ DON'T: Call OpenAI directly
const response = await openai.chat.completions.create(...); // AVOID
```

---

## 8. Common Pitfalls to Avoid

### 8.1 Architecture Violations

| ❌ DON'T | ✅ DO |
|----------|-------|
| Create new folders outside the defined structure | Use existing folder structure from Section 3.3 |
| Invent new database tables not in DOMAIN_MODEL.md | Propose additions by asking first |
| Skip migrations and manually alter the DB | Always use migrations |
| Call LLM providers directly | Use the LLM Router |
| Store secrets in code | Use environment variables |

### 8.2 Code Quality Violations

| ❌ DON'T | ✅ DO |
|----------|-------|
| Use `any` type | Define proper interfaces |
| Skip error handling | Handle all error cases |
| Write tests after implementation | Write tests first or alongside |
| Leave console.log statements | Use proper logger |
| Ignore linting errors | Fix all lint issues |

### 8.3 Process Violations

| ❌ DON'T | ✅ DO |
|----------|-------|
| Jump ahead to later phases | Complete phases in order |
| Skip acceptance criteria | Verify all criteria are met |
| Implement features not in the spec | Stick to the spec |
| Ignore existing patterns | Follow established patterns |

---

## 9. Communication Guidelines

### 9.1 When to Ask for Clarification

Ask the human for clarification when:

- A spec document is ambiguous or contradictory
- The implementation choice has significant trade-offs
- You need to deviate from the spec for good reason
- The task seems to depend on incomplete prior work
- You discover a potential security or performance issue

### 9.2 How to Report Progress

When completing a task, report:

1. **What was implemented** (summary)
2. **Files created/modified** (list)
3. **Tests added** (summary)
4. **Acceptance criteria status** (all met? which ones?)
5. **Any deviations or decisions made**
6. **Next recommended task**

Example:
```
✅ Completed Task 2.2.1 — Vehicles table & model

Files created:
- /backend/prisma/migrations/20250127_vehicles.sql
- /backend/src/models/Vehicle.ts
- /backend/tests/unit/models/Vehicle.test.ts

Tests: 
- 4 tests added, all passing
- Covers: create, findById, findOrCreate, unique constraint

Acceptance Criteria:
- ✅ Migration runs successfully
- ✅ Unique constraint on (year, make, model, trim, engine)
- ✅ Model functions work in tests

Next: Task 2.2.2 — Parts, SupplierParts, Fitments tables
```

---

## 10. Quality Assurance Checklist

Before considering ANY task complete, verify:

### 10.1 Code Quality
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Prettier formatting applied
- [ ] No `any` types unless justified
- [ ] All functions have explicit return types
- [ ] Error handling is comprehensive

### 10.2 Testing
- [ ] All specified tests are written
- [ ] All tests pass (`npm run test`)
- [ ] Edge cases are covered
- [ ] External services are mocked

### 10.3 Documentation
- [ ] JSDoc comments on public functions
- [ ] Complex logic has inline comments
- [ ] README updated if needed
- [ ] API endpoints documented

### 10.4 Consistency
- [ ] Follows naming conventions
- [ ] Uses established patterns
- [ ] File structure matches guidelines
- [ ] Database schema matches DOMAIN_MODEL.md

### 10.5 Acceptance
- [ ] All acceptance criteria from PROJECT_TODO.md are met
- [ ] No regressions in existing functionality
- [ ] Works in development environment

---

## 11. Technology-Specific Guidance

### 11.1 TypeScript/Node.js

- Use Node.js 18+ features (native fetch, etc.)
- Prefer ESM modules if possible
- Use `tsx` for development, compile for production
- Avoid synchronous operations in async contexts

### 11.2 Postgres/pgvector

- Use UUIDs for primary keys (gen_random_uuid())
- Use TIMESTAMPTZ for all timestamps
- Use JSONB for flexible/nested data
- Understand pgvector operators: `<->` (L2), `<=>` (cosine), `<#>` (inner product)

### 11.3 React/Tailwind

- Use functional components with hooks
- Follow BRAND_GUIDE.md for colors
- Mobile-first responsive design
- Prefer Tailwind utilities over custom CSS

### 11.4 Testing

- Use Vitest or Jest (as configured)
- Use Supertest for API testing
- Use @testing-library for React components

---

## 12. Emergency Procedures

### 12.1 If You Break Something

1. **Stop and assess** — Don't make it worse
2. **Identify the root cause** — What change caused the issue?
3. **Revert if necessary** — `git checkout` the affected files
4. **Report to the human** — Explain what happened and why
5. **Fix properly** — Don't patch with hacks

### 12.2 If You're Stuck

1. **Re-read the spec documents** — The answer is usually there
2. **Check existing code** — Look for similar implementations
3. **Consult the workspace** — Search for patterns
4. **Ask for help** — Describe what you've tried

### 12.3 If Requirements Conflict

1. **Document the conflict** — Be specific
2. **Propose options** — With trade-offs
3. **Ask for guidance** — Don't assume

---

## 13. Success Metrics for AI Coding Agents

You are doing an excellent job if:

1. **Tasks complete on first attempt** — Minimal back-and-forth
2. **Tests pass immediately** — No test debugging cycles
3. **Code reviews have minimal feedback** — Clean implementation
4. **Architecture stays clean** — No accumulating tech debt
5. **Documentation stays current** — No orphaned docs
6. **Human rarely needs to intervene** — Autonomous execution

---

## 14. Final Notes

### Remember Your Purpose

You are building a production system that will:
- Handle real supplier data
- Serve real customers
- Process real money
- Need to be maintained for years

**Every shortcut you take will be paid for later.**

### The Golden Rules

1. **Read the docs first** — The answer is usually there
2. **Test everything** — If it's not tested, it doesn't work
3. **Be consistent** — Follow patterns, don't invent new ones
4. **Be explicit** — No magic, no assumptions
5. **Be thorough** — Complete tasks fully, don't leave loose ends

### Your Signature

At the end of each implementation session, mentally sign your work:

> "I, the AI coding agent, certify that this implementation:
> - Meets all acceptance criteria
> - Is fully tested
> - Follows all coding standards
> - Is ready for production"

If you can't make that statement, you're not done.

---

# End of AGENTS.md
