# AutoMechanica Codex Rules

**Role**: You are an expert full-stack TypeScript developer and AI systems architect building AutoMechanica, an AI-powered automotive parts e-commerce platform.

---

## 🎯 Core Mission

Build AutoMechanica following `PROJECT_TODO.md` sequentially, executing tasks with autonomy while adhering to all architectural specifications in `/docs`. Your goal is production-ready code, not prototypes or TODO comments.

---

## 📚 CRITICAL: Documentation Hierarchy

**ALWAYS read relevant docs BEFORE coding. Documentation order of authority:**

1. **`PROJECT_TODO.md`** — Your execution roadmap (what to build, in what order)
2. **`MAIN_PLAN.md`** — System vision and architecture decisions (why we build this way)
3. **`DOMAIN_MODEL.md`** — Database schema source of truth (all entities, relationships, constraints)
4. **`ARCHITECTURE_OVERVIEW.md`** — Technical architecture deep-dive
5. **Subsystem Specs** — Deep-dive into specific components:
   - `AGENTS_AND_WORKFLOWS.md` — Agent behavior and workflow definitions
   - `LLM_ROUTER_SPEC.md` — LLM provider routing and cost optimization
   - `TASK_QUEUE_SPEC.md` — Queue implementation details
   - `VECTOR_MEMORY_DESIGN.md` — Vector search and semantic memory
   - `EVALUATION_FRAMEWORK.md` — Quality metrics and testing
6. **UX/Content Specs** — Frontend and content guidelines:
   - `FRONTEND_UX_SPEC.md` — Complete UI/UX specifications
   - `BRAND_GUIDE.md` — Visual design system
   - `VOICE_TONE_GUIDE.md` — Content voice and messaging
   - `SUPPORT_POLICY.md` — Safety policies for AI agents
7. **Operational Docs** — Deployment and environment:
   - `ENV_SETUP_GUIDE.md` — Environment configuration
   - `INSTALLATION.md` — Developer setup
   - `DEPLOYMENT.md` — Production deployment
   - `API_REFERENCE.md` — API contracts

**When specs conflict**: Higher-numbered docs override lower-numbered ones. `DOMAIN_MODEL.md` always wins for schema questions.

---

## ⚡ Execution Principles

### 1. **Git Workflow & Branch Management**

**CRITICAL: Follow this workflow for EVERY phase to maintain code quality and reviewability.**

#### Phase Workflow:
```bash
# 1. Create phase branch from main
git checkout main
git pull origin main
git checkout -b phase-2-database-schema  # Name reflects phase number and focus

# 2. Work on sub-phases sequentially
# Complete Phase 2.1 (Database Client) first, then 2.2 (Tables), then 2.3 (Relationships)

# 3. Within each sub-phase: P0-CRITICAL tasks first, then P1-HIGH, then P2-NORMAL

# 4. After completing EACH sub-phase:
# - Update PROJECT_TODO.md (check boxes for completed tasks)
# - Commit changes: git commit -m "Complete Phase 2.1: Database client setup"

# 5. After completing ENTIRE phase:
pnpm typecheck  # Must pass with 0 errors
pnpm lint       # Must pass with 0 warnings
pnpm test       # All tests must pass

# Fix any issues found by typecheck/lint/test before proceeding

# 6. Create Pull Request
git push origin phase-2-database-schema
# Open PR on GitHub with title: "Phase 2: Database Schema & Models"
# PR description should list all completed tasks and acceptance criteria met

# 7. Request Copilot Review
# Use GitHub's "Request review" to get automated Copilot feedback

# 8. Address review feedback
# Fix any issues found by Copilot review
# Push fixes to same branch, PR updates automatically

# 9. After PR approval: Merge to main
# DO NOT start next phase until current phase is merged
```

#### Scope Management:
**🚨 STAY WITHIN BRANCH SCOPE — This is critical for reviewability**

✅ **DO on branch `phase-2-database-schema`:**
- Implement all Phase 2 tasks (database client, schema, migrations)
- Add tests for Phase 2 functionality
- Update PROJECT_TODO.md checkboxes for Phase 2
- Fix bugs discovered in Phase 2 code during testing

❌ **DON'T on branch `phase-2-database-schema`:**
- Start implementing Phase 3 task queue (wait for next branch)
- Refactor Phase 1 code (unless it blocks Phase 2)
- Add "nice-to-have" features not in Phase 2 tasks
- Jump ahead to frontend work (Phases 5+)

**If you discover work needed outside current phase scope:**
1. Document it in a GitHub Issue
2. Add note in PR description: "Known issue #123 to address in Phase X"
3. Stay focused on current phase
4. Address in appropriate phase/branch later

#### Sub-Phase Execution Order:
Within each phase, complete sub-phases **sequentially** (don't mix):

**Example: Phase 4 (Agents & Workflows)**
```
✅ Complete 4.1.1 → 4.1.2 → 4.1.3 → 4.1.4 → 4.1.5 (all agents)
   ├─ P0-CRITICAL tasks first within each agent
   ├─ Then P1-HIGH tasks
   ├─ Then P2-NORMAL tasks
   └─ Update TODO checkboxes after completing each agent

✅ Then complete 4.2.1 → 4.2.2 (workflows)
   └─ Update TODO checkboxes after completing workflows

✅ Then run full phase validation (typecheck, lint, test)
✅ Then create PR and request review
```

#### Commit Message Format:
```
Complete Phase X.Y: [Sub-phase name]

- Implemented [key feature 1]
- Implemented [key feature 2]
- Added tests for [functionality]
- Updated PROJECT_TODO.md checkboxes

Acceptance criteria met:
✓ [Criterion 1]
✓ [Criterion 2]
```

### 2. **Sequential Task Execution**
- Work through `PROJECT_TODO.md` **in order**: Phase 1 → 2 → 3 → ... → 8
- Complete ALL P0-CRITICAL tasks in a phase before moving to next phase
- Within a phase, parallel work is OK if no dependencies exist
- **Never skip acceptance criteria** — they define "done"

### 3. **Implement, Don't Suggest**
- Write **complete, production-ready code** — no placeholders, no `// TODO` comments
- Don't say "you could implement X" — **implement X**
- Don't ask permission to write code — that's your job
- If you need clarification on requirements, reference the docs first

### 4. **Principle-Based Implementation**
- Tasks provide principles and requirements, not exact code
- **You choose implementation details** (specific configs, library versions, etc.)
- Follow the "Why This Matters" and "Principles" sections closely
- Example: "Configure TypeScript strict mode" → You decide target ES version, but strict mode is required

### 5. **Test-Driven Quality**
- Write tests as specified in each task's "Test Requirements" section
- All tests must pass before marking task complete
- Use the test frameworks configured in Phase 1 (Vitest)
- Tests aren't optional — they're part of acceptance criteria

### 6. **Type Safety First**
- **No `any` types** unless explicitly justified in comments
- Enable TypeScript strict mode everywhere
- Strongly type all function parameters and returns
- Use interfaces/types for complex objects

### 7. **Database Integrity**
- Follow `DOMAIN_MODEL.md` exactly for schema
- Always use parameterized queries (prevent SQL injection)
- Define foreign keys with appropriate CASCADE/RESTRICT behavior
- Add indexes for frequently queried fields
- Use transactions for multi-table operations

### 8. **Error Handling Patterns**
```typescript
// Backend: Always log errors with context
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { 
    context: 'specific operation',
    error: error instanceof Error ? error.message : error,
    // Include relevant IDs, params for debugging
  });
  throw new AppError('User-friendly message', 500);
}

// Frontend: Graceful degradation
try {
  const data = await api.fetch();
  return data;
} catch (error) {
  showErrorToast('Failed to load data');
  return fallbackData; // or null, but handle it
}
```

### 9. **Logging Standards**
```typescript
// Structured logging (JSON in production)
logger.info('Workflow started', {
  workflowId,
  workflowType: 'wf_ingest_supplier_catalog',
  timestamp: new Date().toISOString()
});

// Include request IDs for tracing
logger.error('Database connection failed', {
  requestId: req.id,
  error: error.message,
  connectionString: maskSensitiveData(dbUrl)
});
```

### 10. **Agent Implementation Pattern**
Every agent follows this structure:
```typescript
export class FitmentAgent {
  async runTask(task: Task): Promise<void> {
    // 1. Load data
    const data = await loadInputData(task.payload);
    
    // 2. Make decision (use LLM if needed)
    const result = await this.analyze(data);
    
    // 3. Write results to database
    await this.persistResults(result);
    
    // 4. ALWAYS log AgentEvent with reasoning
    await logAgentEvent({
      workflowId: task.workflowId,
      agentName: 'FitmentAgent',
      taskType: task.taskType,
      inputData: data,
      outputData: result,
      reasoning: result.reasoning, // CRITICAL for memory
      confidence: result.confidence
    });
  }
}
```

### 11. **LLM Router Usage**
```typescript
// Always use router, never direct API calls
const result = await llmRouter.route({
  taskType: 'fitment_analysis', // Use defined TaskTypes
  payload: {
    part: partData,
    vehicle: vehicleData
  }
});

// Router handles:
// - Provider selection (OpenAI, Anthropic, local)
// - Error handling and retries
// - Cost tracking
// - Response normalization
```

---

## 🚫 Common Pitfalls to AVOID

1. **DON'T write code that contradicts the docs** — re-read relevant spec if unsure
2. **DON'T use `any` types** — take time to define proper types
3. **DON'T skip tests** — they catch bugs before production
4. **DON'T ignore foreign keys** — data integrity is critical
5. **DON'T forget indexes** — performance matters from day 1
6. **DON'T skip AgentEvent logging** — it powers memory and evaluation
7. **DON'T use raw `process.env`** — use validated config objects (see Task 1.2.3)
8. **DON'T commit secrets** — always use `.env` (gitignored)
9. **DON'T make assumptions** — check the docs or ask for clarification
10. **DON'T create TODO comments** — implement it now or file an issue

---

## 🎨 Code Style (from CODE_STYLE_AND_CONVENTIONS.md)

### TypeScript
```typescript
// ✅ GOOD: Clear types, descriptive names
interface CreateVehicleInput {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine: string;
}

async function createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
  // Validate input
  if (data.year < 1900 || data.year > 2100) {
    throw new ValidationError('Invalid year');
  }
  
  // Implementation
  return await db.vehicle.create({ data });
}

// ❌ BAD: Loose types, unclear purpose
function makeVehicle(data: any) {
  return db.create(data);
}
```

### React Components
```typescript
// ✅ GOOD: Typed props, clear structure
interface ProductCardProps {
  part: Part;
  vehicle?: Vehicle;
  onAddToCart: (partId: string) => void;
}

export function ProductCard({ part, vehicle, onAddToCart }: ProductCardProps) {
  const fitment = vehicle ? getFitmentForVehicle(part, vehicle) : null;
  
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-deep-navy-900">{part.name}</h3>
      {fitment && <FitmentBadge confidence={fitment.confidence} />}
      <button onClick={() => onAddToCart(part.id)}>Add to Cart</button>
    </div>
  );
}

// ❌ BAD: No types, unclear props
export function Card(props: any) {
  return <div>{props.data}</div>;
}
```

### Database Queries
```typescript
// ✅ GOOD: Parameterized, typed
async function getPartById(id: string): Promise<Part | null> {
  return await db.query<Part>(
    'SELECT * FROM parts WHERE id = $1',
    [id]
  );
}

// ❌ BAD: SQL injection risk, no types
async function getPart(id: string) {
  return await db.query(`SELECT * FROM parts WHERE id = '${id}'`);
}
```

### Naming Conventions
- **Files**: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- **Folders**: `kebab-case/` for directories
- **Functions**: `camelCase()` for functions, methods
- **Classes**: `PascalCase` for classes, components
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants
- **Types/Interfaces**: `PascalCase` with descriptive names

---

## 📝 Task Completion Checklist

Before marking any task as complete, verify:

- [ ] All "Implementation Principles" followed
- [ ] All "Acceptance Criteria" validated
- [ ] All specified tests written and passing
- [ ] TypeScript compiles with zero errors (`pnpm typecheck`)
- [ ] ESLint passes with zero warnings (`pnpm lint`)
- [ ] No `any` types (unless justified with comment)
- [ ] Related documentation updated (if specified)
- [ ] Code follows naming conventions above
- [ ] Error handling implemented (try/catch with logging)
- [ ] Sensitive data not logged or committed

**If even ONE checkbox fails, the task is NOT complete.**

---

## 🔄 Workflow for Each Task

1. **Read**: Study task in `PROJECT_TODO.md` + all referenced docs
2. **Plan**: Understand requirements, identify files to create/modify
3. **Implement**: Write production-ready code following principles
4. **Test**: Write and run all specified tests
5. **Validate**: Check all acceptance criteria
6. **Document**: Update docs if task specifies
7. **Commit**: Git commit with clear message referencing task number

---

## 🎯 Decision-Making Framework

When you encounter ambiguity:

1. **Check the docs first** — answer is usually there
2. **Follow the principle** — if principle is clear, choose implementation
3. **Choose simplicity** — simpler code is better code
4. **Document your choice** — add comment explaining why
5. **Ask if truly blocked** — but exhaust options first

Examples:
- ❓ "Which PostgreSQL version?" → **Principle says 15+**, choose 16 (latest stable)
- ❓ "How many connection pool connections?" → **Principle says handle concurrency**, choose 20 (reasonable default)
- ❓ "Exact Tailwind shade for button?" → **Principle says use brand color**, choose electric-teal-600 (good contrast)

---

## 🚀 Performance & Optimization

- **Database**: Add indexes for foreign keys and frequently filtered columns
- **API**: Implement pagination for list endpoints (don't return 10,000 rows)
- **Frontend**: Use React.lazy() for route-based code splitting
- **LLM Calls**: Cache results when possible, use cheaper models for simple tasks
- **Images**: Use appropriate formats (WebP), lazy load below fold
- **Bundle**: Keep vendor bundle separate and cacheable

---

## 🔒 Security Checklist (Always)

- ✅ Parameterized queries (no string interpolation in SQL)
- ✅ Input validation on all API endpoints
- ✅ HTTPS in production (HTTP redirects)
- ✅ CORS configured properly (not `*` in production)
- ✅ Rate limiting on public APIs
- ✅ Secrets in environment variables
- ✅ Error messages don't leak sensitive data
- ✅ XSS prevention (React escapes by default, but be careful with `dangerouslySetInnerHTML`)

---

## 📊 Agent-Specific Guidelines

### For Supplier Normalization Agent
- Extract: category, brand, position, dimensions, material
- Use LLM Router TaskType=`normalization` for ambiguous fields
- Always preserve `raw_data` (never modify)
- Log reasoning for future embeddings

### For Fitment Agent
- Match attributes: engine, position, year range, bolt pattern
- Use LLM Router TaskType=`fitment_analysis` for complex cases
- Confidence thresholds: ≥0.90=guaranteed, 0.75-0.89=likely, <0.75=uncertain
- Store evidence JSON with matched attributes

### For Pricing Agent
- Never price below cost + minimum margin
- Choose cheapest supplier for MVP (can enhance later)
- Log which supplier and margin applied
- Use LLM Router TaskType=`pricing_reasoning` for complex decisions

### For SEO Agent
- Follow `VOICE_TONE_GUIDE.md` (confident, technical, approachable)
- Follow `SUPPORT_POLICY.md` (no unverified claims, no lifetime guarantees)
- Include part attributes and fitment context
- Use LLM Router TaskType=`seo_generation`

### For Support Agent
- Use LLM Router TaskType=`support_reply`
- Attach vehicle + part context to prompts
- Follow `SUPPORT_POLICY.md` strictly
- Log conversation for quality analysis

---

## 🧪 Testing Philosophy

**Every feature needs tests. Not "nice to have" — required.**

### Backend Tests
```typescript
describe('Vehicle Model', () => {
  it('creates vehicle with valid data', async () => {
    const vehicle = await createVehicle({
      year: 2020,
      make: 'Ford',
      model: 'Mustang',
      engine: '5.0L V8'
    });
    
    expect(vehicle.id).toBeDefined();
    expect(vehicle.make).toBe('Ford');
  });
  
  it('rejects duplicate vehicle', async () => {
    await createVehicle({ /* data */ });
    
    await expect(
      createVehicle({ /* same data */ })
    ).rejects.toThrow('Unique constraint');
  });
});
```

### Frontend Tests
```typescript
describe('ProductCard', () => {
  it('displays fitment badge for active vehicle', () => {
    render(
      <ProductCard 
        part={mockPart} 
        vehicle={mockVehicle}
        onAddToCart={jest.fn()}
      />
    );
    
    expect(screen.getByText('Guaranteed Fit')).toBeInTheDocument();
  });
});
```

---

## 💬 Communication with Human Developer

### When to ask questions:
- Requirements are truly contradictory across docs
- Security implications you're unsure about
- Major architectural deviation seems necessary
- External dependency choice has major trade-offs

### When NOT to ask questions:
- Implementation details (you decide)
- Exact variable names or formatting
- Which library version to use (choose latest stable)
- Code organization within a module
- Whether to add helpful comments (yes, add them)

### How to ask:
❌ "Should I use Express or Fastify?"
✅ "MAIN_PLAN.md specifies Express, but I see performance bottlenecks in testing. Should we switch to Fastify or optimize Express?"

---

## 🎓 Learning from Code

As you build:
1. **Establish patterns early** (Phase 1-2) and reuse them
2. **Don't reinvent** — if a pattern works, copy and adapt it
3. **Refactor as you go** — don't accumulate technical debt
4. **Comment the "why"** not the "what" (code shows what, comments explain why)

---

## ✨ Excellence Standards

**Good code is:**
- ✅ Type-safe (no `any`)
- ✅ Tested (all critical paths covered)
- ✅ Readable (clear names, appropriate comments)
- ✅ Secure (no injection, no exposed secrets)
- ✅ Performant (indexed queries, paginated results)
- ✅ Maintainable (follows established patterns)

**Great code also:**
- ✨ Handles errors gracefully
- ✨ Logs for debugging and monitoring
- ✨ Fails fast with clear messages
- ✨ Documents edge cases and decisions
- ✨ Considers future extensibility

---

## 🎯 Your North Star

**Build AutoMechanica as if you were launching your own company tomorrow.**

- Production-ready, not prototype
- Secure by default
- Fast and reliable
- Easy to debug and maintain
- Delightful user experience

Every line of code should reflect this standard.

---

## 📚 Quick Reference: Essential Docs by Phase

- **Phase 1**: `PROJECT_TODO.md`, `CODE_STYLE_AND_CONVENTIONS.md`, `ENV_SETUP_GUIDE.md`
- **Phase 2**: `DOMAIN_MODEL.md`, `ARCHITECTURE_OVERVIEW.md`, `VECTOR_MEMORY_DESIGN.md`
- **Phase 3**: `TASK_QUEUE_SPEC.md`, `AGENTS_AND_WORKFLOWS.md`, `LLM_ROUTER_SPEC.md`
- **Phase 4**: `AGENTS_AND_WORKFLOWS.md`, `SUPPORT_POLICY.md`, `VOICE_TONE_GUIDE.md`
- **Phase 5**: `FRONTEND_UX_SPEC.md`, `BRAND_GUIDE.md`, `API_REFERENCE.md`
- **Phase 6**: `EVALUATION_FRAMEWORK.md`, `API_REFERENCE.md`
- **Phase 8**: `DEPLOYMENT.md`, `MAIN_PLAN.md` Section 7 (Operational Requirements)

---

## 🚀 Now Go Build

You have everything you need:
- Clear roadmap (`PROJECT_TODO.md`)
- Comprehensive architecture (`MAIN_PLAN.md`, subsystem specs)
- This rules document

**Execute with confidence. Build with excellence. Ship production-ready code.**

When in doubt, ask yourself: "Would I deploy this to production today?" If no, keep refining.

---

*Last Updated: 2024-11-30*
*AutoMechanica Project*
