# Codex Thoroughness Instructions

**CRITICAL: Read this document before starting any work. These instructions override any instinct to take shortcuts or "good enough" approaches.**

---

## 🎯 Core Principle: Excellence Over Speed

**Your job is to build production-ready software, not prototypes.** Taking time to be thorough now prevents bugs, security issues, and technical debt later. A feature that takes 3 days to build correctly is better than a feature that takes 1 day to build poorly and 5 days to fix.

---

## 📖 Document Review Standards

### When Asked to Review ANY Document:

**DO NOT skim. DO NOT scan. READ EVERY WORD.**

#### Required Review Process:

1. **First Pass: Complete Read-Through**
   - Read the ENTIRE document from top to bottom
   - Don't skip sections that seem "obvious" or "basic"
   - Take notes on key requirements, constraints, and dependencies
   - Flag anything unclear or contradictory

2. **Second Pass: Cross-Reference Check**
   - Compare against related documents (check `Documentation Hierarchy` in CODEX_RULES.md)
   - Verify consistency across all referenced specs
   - Identify any conflicts between documents
   - Note which document takes precedence if conflicts exist

3. **Third Pass: Implementation Analysis**
   - For each requirement, ask: "What code needs to be written to satisfy this?"
   - Identify all acceptance criteria that must be validated
   - List all tests that need to be written
   - Note any performance, security, or scalability implications

4. **Fourth Pass: Edge Cases & Gotchas**
   - Identify error conditions not explicitly mentioned
   - Consider boundary conditions (empty inputs, max values, null/undefined)
   - Think about race conditions, concurrent access, transaction boundaries
   - Look for implicit requirements (e.g., "list users" implies pagination)

#### Document Review Checklist:

Before claiming you've reviewed a document, verify:

- [ ] Read every section completely (no skipping)
- [ ] Understood all technical requirements
- [ ] Identified all acceptance criteria
- [ ] Cross-referenced with related documents
- [ ] Noted all dependencies on other systems/tasks
- [ ] Understood the "why" behind requirements (not just "what")
- [ ] Identified potential edge cases and error scenarios
- [ ] Can explain how this fits into the overall architecture
- [ ] Listed all files that will need to be created/modified
- [ ] Identified all tests that need to be written

**If you cannot check ALL boxes, you have NOT properly reviewed the document.**

---

## 🛠️ Implementation Standards

### When Following Instructions from PROJECT_TODO.md or Other Specs:

**DO NOT cut corners. DO NOT skip steps. DO NOT make assumptions.**

#### Required Implementation Process:

1. **Pre-Implementation Phase**
   ```
   Before writing ANY code:
   ✓ Read the task description 3 times
   ✓ Read "Why This Matters" section (understand context)
   ✓ Read ALL numbered "Principles" (these are requirements)
   ✓ Read "Acceptance Criteria" (this defines "done")
   ✓ Read "Test Requirements" (if present)
   ✓ Read any referenced documentation sections
   ✓ Identify ALL files that need to be created or modified
   ✓ Identify ALL dependencies (other tasks that must be done first)
   ✓ Write a mental checklist of every sub-step required
   ```

2. **Implementation Phase**
   ```
   For EACH principle listed in the task:
   ✓ Read the principle carefully
   ✓ Understand what it requires
   ✓ Implement it completely (no TODOs, no placeholders)
   ✓ Add appropriate error handling
   ✓ Add appropriate logging
   ✓ Add comments explaining non-obvious decisions
   ✓ Write tests validating this principle
   ✓ Run tests and verify they pass
   
   Move to next principle only after current one is COMPLETE.
   ```

3. **Validation Phase**
   ```
   After implementation, validate EVERY acceptance criterion:
   ✓ For each criterion, write down how your code satisfies it
   ✓ Run the specific test that validates this criterion
   ✓ If no test exists, write one NOW
   ✓ Manually verify the behavior matches requirements
   ✓ Check that error cases are handled
   ✓ Verify logging provides adequate debugging info
   
   Only after ALL criteria validated: mark task complete.
   ```

---

## 🚫 Prohibited Shortcuts

### NEVER Do These Things:

❌ **"I'll implement X later"** → Implement it NOW or file a GitHub issue
❌ **"This is good enough for now"** → Make it production-ready NOW
❌ **"I'll add tests after it works"** → Write tests AS YOU CODE
❌ **"This error case is unlikely"** → Handle it anyway
❌ **"I'll just use `any` here"** → Define proper types
❌ **"I'll skip logging for this function"** → Add logging
❌ **"I don't need to validate this input"** → Validate all inputs
❌ **"I'll just scan this doc quickly"** → Read every word
❌ **"This principle seems optional"** → ALL principles are required
❌ **"I understand the gist of this"** → Understand every detail
❌ **"Let me skip to the code examples"** → Read the explanatory text first
❌ **"I'll assume this works like X"** → Verify in documentation
❌ **"This test is redundant"** → Write it anyway
❌ **"I'll commit without running typecheck/lint"** → ALWAYS run validation

---

## 🔍 Thoroughness Self-Check Questions

### Before Claiming ANY Task is Complete:

Ask yourself these questions. If ANY answer is "no" or "unsure", the task is NOT complete.

**Requirements Coverage:**
- [ ] Did I read the ENTIRE task description word-for-word?
- [ ] Did I understand WHY this task matters (not just WHAT to build)?
- [ ] Did I implement EVERY principle listed (not just some)?
- [ ] Did I satisfy EVERY acceptance criterion?
- [ ] Did I check off EVERY item in the Task Completion Checklist (CODEX_RULES.md)?

**Code Quality:**
- [ ] Is there ANY `any` type in my code? (If yes, justify with comment or fix it)
- [ ] Is there ANY `// TODO` or `// FIXME` comment? (If yes, implement it now)
- [ ] Is there ANY placeholder or mock implementation? (If yes, implement it fully)
- [ ] Does EVERY function have proper TypeScript types?
- [ ] Does EVERY function have error handling?
- [ ] Does EVERY critical operation have logging?

**Testing:**
- [ ] Did I write tests for ALL critical functionality?
- [ ] Did I write tests for ALL error conditions?
- [ ] Do ALL tests pass when I run `pnpm test`?
- [ ] Does TypeScript compile with ZERO errors? (`pnpm typecheck`)
- [ ] Does ESLint pass with ZERO warnings? (`pnpm lint`)

**Security & Performance:**
- [ ] Are ALL database queries parameterized (no SQL injection risk)?
- [ ] Are ALL user inputs validated?
- [ ] Are ALL secrets in environment variables (not hardcoded)?
- [ ] Are there indexes on frequently queried database columns?
- [ ] Are paginated endpoints limited to reasonable page sizes?
- [ ] Are error messages user-friendly (not leaking sensitive data)?

**Documentation & Integration:**
- [ ] Did I update any documentation that this task specifies?
- [ ] Did I update PROJECT_TODO.md checkboxes for completed sub-tasks?
- [ ] Does my code follow the naming conventions in CODEX_RULES.md?
- [ ] Does my code match the patterns established in earlier phases?
- [ ] Can another developer understand my code without asking me?

**Edge Cases & Error Handling:**
- [ ] What happens if input is null/undefined? (Handled?)
- [ ] What happens if database connection fails? (Handled?)
- [ ] What happens if external API is down? (Handled?)
- [ ] What happens if user lacks permissions? (Handled?)
- [ ] What happens with empty arrays/strings? (Handled?)
- [ ] What happens at maximum values (int overflow, string length)? (Handled?)
- [ ] What happens with concurrent requests? (Safe?)

---

## 📋 Detailed Review Examples

### Example 1: Reviewing a Database Schema Task

**❌ SUPERFICIAL REVIEW (UNACCEPTABLE):**
> "Task says create vehicles table. I'll add year, make, model columns. Done."

**✅ THOROUGH REVIEW (REQUIRED):**

```markdown
Task 2.2.1: Vehicles Table

Pre-Implementation Checklist:
✓ Read DOMAIN_MODEL.md section on Vehicles (lines 45-89)
✓ Read ARCHITECTURE_OVERVIEW.md section on data modeling (lines 234-267)
✓ Noted constraints: year must be 1900-2100, make/model required
✓ Noted relationships: vehicles link to fitments (one-to-many)
✓ Noted indexes needed: (year, make, model) composite for filtering
✓ Noted unique constraint: (year, make, model, trim, engine) composite

Implementation Plan:
1. Create migration file: YYYYMMDDHHMMSS_create_vehicles_table.sql
2. Add ALL columns from DOMAIN_MODEL.md:
   - id (UUID, PRIMARY KEY)
   - year (INTEGER, NOT NULL, CHECK 1900-2100)
   - make (VARCHAR(100), NOT NULL)
   - model (VARCHAR(100), NOT NULL)
   - trim (VARCHAR(100), NULLABLE)
   - engine (VARCHAR(100), NOT NULL)
   - created_at (TIMESTAMPTZ, DEFAULT NOW())
   - updated_at (TIMESTAMPTZ, DEFAULT NOW())
3. Add composite unique constraint on (year, make, model, trim, engine)
4. Add composite index on (year, make, model) for vehicle picker queries
5. Create TypeScript interface matching schema exactly
6. Create database model with typed CRUD methods
7. Write tests:
   - Create vehicle with valid data
   - Reject vehicle with year < 1900
   - Reject vehicle with year > 2100
   - Reject duplicate vehicle (unique constraint)
   - Verify indexes exist (query pg_indexes)

Acceptance Criteria from Task:
✓ "Vehicles table matches DOMAIN_MODEL.md exactly" - will validate each column
✓ "Composite unique constraint prevents duplicates" - test will verify
✓ "Index on (year, make, model) for performance" - test will verify
✓ "TypeScript types match schema" - will use generated types from database

Dependencies:
- Task 2.1.1 (Database client) must be complete first
- Migration tool must be configured

Estimated time: 2-3 hours (including tests and validation)
```

### Example 2: Implementing an Agent Task

**❌ SUPERFICIAL IMPLEMENTATION (UNACCEPTABLE):**
```typescript
// Task 4.1.1: Supplier Normalization Agent
class SupplierNormalizationAgent {
  async run(data: any) {
    const result = await callLLM(data);
    return result;
  }
}
```

**✅ THOROUGH IMPLEMENTATION (REQUIRED):**

```typescript
// Task 4.1.1: Supplier Normalization Agent
// Purpose: Extract structured product data from raw supplier feeds
// See: AGENTS_AND_WORKFLOWS.md lines 123-189 for full specification

import { logger } from '@/lib/logger';
import { llmRouter } from '@/lib/llm-router';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';

interface SupplierNormalizationInput {
  rawProductId: string;
  rawData: Record<string, unknown>;
  supplierId: string;
}

interface SupplierNormalizationOutput {
  category: string;
  subcategory: string | null;
  brand: string;
  partNumber: string;
  position: string | null; // 'front', 'rear', 'left', 'right', etc.
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit: 'in' | 'mm' | 'lb' | 'kg';
  } | null;
  material: string | null;
  confidence: number; // 0.0 to 1.0
  reasoning: string; // CRITICAL: Explains extraction decisions
}

export class SupplierNormalizationAgent {
  /**
   * Normalize raw supplier product data into structured format
   * 
   * Implements principles from Task 4.1.1:
   * 1. Preserve raw_data (never modify original)
   * 2. Extract standardized attributes
   * 3. Use LLM Router for ambiguous fields
   * 4. Log reasoning for memory/evaluation
   * 5. Handle missing/malformed data gracefully
   */
  async runTask(task: Task): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 1. Validate input
      const input = this.validateInput(task.payload);
      
      // 2. Load raw product data from database
      const rawProduct = await this.loadRawProduct(input.rawProductId);
      if (!rawProduct) {
        throw new AppError(
          `Raw product ${input.rawProductId} not found`,
          404
        );
      }
      
      // 3. Extract structured data (use LLM for complex fields)
      const normalized = await this.extractStructuredData(
        rawProduct.raw_data,
        input.supplierId
      );
      
      // 4. Persist results to database
      await this.persistNormalizedData(input.rawProductId, normalized);
      
      // 5. ALWAYS log AgentEvent with reasoning (Principle #4 from task)
      await this.logAgentEvent({
        workflowId: task.workflowId,
        taskId: task.id,
        agentName: 'SupplierNormalizationAgent',
        inputData: { rawProductId: input.rawProductId },
        outputData: normalized,
        reasoning: normalized.reasoning,
        confidence: normalized.confidence,
        executionTimeMs: Date.now() - startTime
      });
      
      logger.info('Supplier normalization completed', {
        rawProductId: input.rawProductId,
        confidence: normalized.confidence,
        executionTimeMs: Date.now() - startTime
      });
      
    } catch (error) {
      // Error handling (Principle #8 from CODEX_RULES.md)
      logger.error('Supplier normalization failed', {
        taskId: task.id,
        rawProductId: task.payload.rawProductId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Log failure event for evaluation
      await this.logAgentEvent({
        workflowId: task.workflowId,
        taskId: task.id,
        agentName: 'SupplierNormalizationAgent',
        inputData: task.payload,
        outputData: null,
        reasoning: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        executionTimeMs: Date.now() - startTime
      });
      
      throw error; // Re-throw for task queue retry logic
    }
  }
  
  private validateInput(payload: unknown): SupplierNormalizationInput {
    // Input validation (Principle #7 from CODEX_RULES.md - Security)
    if (!payload || typeof payload !== 'object') {
      throw new AppError('Invalid payload: must be an object', 400);
    }
    
    const { rawProductId, rawData, supplierId } = payload as Record<string, unknown>;
    
    if (typeof rawProductId !== 'string' || !rawProductId) {
      throw new AppError('Invalid rawProductId: must be non-empty string', 400);
    }
    
    if (!rawData || typeof rawData !== 'object') {
      throw new AppError('Invalid rawData: must be an object', 400);
    }
    
    if (typeof supplierId !== 'string' || !supplierId) {
      throw new AppError('Invalid supplierId: must be non-empty string', 400);
    }
    
    return { rawProductId, rawData: rawData as Record<string, unknown>, supplierId };
  }
  
  private async loadRawProduct(id: string): Promise<RawProduct | null> {
    // Database query (Principle #7 from CODEX_RULES.md - parameterized)
    return await db.query<RawProduct>(
      'SELECT * FROM raw_products WHERE id = $1',
      [id]
    );
  }
  
  private async extractStructuredData(
    rawData: Record<string, unknown>,
    supplierId: string
  ): Promise<SupplierNormalizationOutput> {
    // Use LLM Router for complex extraction (Principle #11 from CODEX_RULES.md)
    const result = await llmRouter.route({
      taskType: 'normalization', // Defined in LLM_ROUTER_SPEC.md
      payload: {
        rawData,
        supplierId,
        instructions: `Extract structured product attributes from raw supplier data.
          Focus on: category, brand, part_number, position, dimensions, material.
          Return confidence score and reasoning for extraction decisions.`
      }
    });
    
    // Validate LLM output structure
    return this.validateNormalizedOutput(result);
  }
  
  private validateNormalizedOutput(output: unknown): SupplierNormalizationOutput {
    // Validate LLM response structure (don't trust external data)
    // Implementation details: check all required fields, types, ranges
    // ... (validation logic here)
    return output as SupplierNormalizationOutput; // Type assertion after validation
  }
  
  private async persistNormalizedData(
    rawProductId: string,
    normalized: SupplierNormalizationOutput
  ): Promise<void> {
    // Use transaction for data consistency (Principle #7)
    await db.transaction(async (trx) => {
      // Update raw_products with normalized data
      await trx.query(
        `UPDATE raw_products 
         SET normalized_data = $1, 
             normalization_confidence = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [JSON.stringify(normalized), normalized.confidence, rawProductId]
      );
    });
  }
  
  private async logAgentEvent(event: AgentEventInput): Promise<void> {
    // Log to agent_events table for memory and evaluation
    await db.query(
      `INSERT INTO agent_events 
       (workflow_id, task_id, agent_name, input_data, output_data, reasoning, confidence, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        event.workflowId,
        event.taskId,
        event.agentName,
        JSON.stringify(event.inputData),
        JSON.stringify(event.outputData),
        event.reasoning,
        event.confidence,
        event.executionTimeMs
      ]
    );
  }
}

// Tests (Principle #5 from CODEX_RULES.md - Test-Driven Quality)
describe('SupplierNormalizationAgent', () => {
  let agent: SupplierNormalizationAgent;
  
  beforeEach(() => {
    agent = new SupplierNormalizationAgent();
  });
  
  describe('runTask', () => {
    it('successfully normalizes valid product data', async () => {
      const task = createMockTask({
        rawProductId: 'raw_123',
        rawData: { name: 'Brake Pad Set', brand: 'Brembo' },
        supplierId: 'sup_456'
      });
      
      await agent.runTask(task);
      
      // Verify normalized data was persisted
      const normalized = await db.query(
        'SELECT normalized_data FROM raw_products WHERE id = $1',
        ['raw_123']
      );
      expect(normalized).toBeDefined();
      expect(normalized.brand).toBe('Brembo');
    });
    
    it('handles missing raw product gracefully', async () => {
      const task = createMockTask({
        rawProductId: 'nonexistent',
        rawData: {},
        supplierId: 'sup_456'
      });
      
      await expect(agent.runTask(task)).rejects.toThrow('not found');
    });
    
    it('logs agent event with reasoning', async () => {
      const task = createMockTask(validPayload);
      
      await agent.runTask(task);
      
      // Verify event was logged
      const events = await db.query(
        'SELECT * FROM agent_events WHERE task_id = $1',
        [task.id]
      );
      expect(events).toHaveLength(1);
      expect(events[0].reasoning).toBeDefined();
      expect(events[0].confidence).toBeGreaterThanOrEqual(0);
      expect(events[0].confidence).toBeLessThanOrEqual(1);
    });
    
    // More tests for error cases, edge cases, etc.
  });
});
```

---

## 🎯 When to Push Back

**If you encounter unclear or contradictory requirements, ASK rather than assume.**

### DO push back when:
- Two documents contradict each other (which takes precedence?)
- Requirements are ambiguous (what exactly should happen?)
- Security implications are unclear (is this approach safe?)
- Acceptance criteria are missing (how do I know when it's done?)
- The suggested approach conflicts with best practices (should we reconsider?)

### Example of Good Pushback:
> "Task 3.2.1 says to use in-memory queue for MVP, but ARCHITECTURE_OVERVIEW.md emphasizes horizontal scalability. An in-memory queue won't work across multiple servers. Should we use Redis from the start, or document this as a known limitation to address in Phase 7?"

---

## 🏆 Thoroughness Mindset

### Remember:

**"Good enough" is not good enough for production software.**

- Every shortcut creates technical debt
- Every skipped test creates a potential bug
- Every `any` type removes type safety
- Every missing error handler creates a failure mode
- Every assumption creates a misunderstanding

**Your thoroughness protects:**
- Users from bugs and security issues
- Future developers from technical debt
- The business from downtime and data loss
- Your own reputation as a professional engineer

---

## ✅ Success Criteria

**You are being thorough when:**

✅ You read every word of every relevant document
✅ You implement every principle, not just the ones that seem important
✅ You write tests for every feature and error case
✅ You handle every error condition explicitly
✅ You validate every input
✅ You log every critical operation
✅ You check your work against every acceptance criterion
✅ You run typecheck/lint/test before every commit
✅ You can confidently say "this is production-ready"

**You are cutting corners when:**

❌ You skim documents looking for code examples
❌ You implement the "happy path" but skip error handling
❌ You skip tests planning to "add them later"
❌ You use `any` types to avoid thinking about types
❌ You assume something works without testing it
❌ You commit code without running validation
❌ You mark a task complete while acceptance criteria are unmet

---

## 🚀 Final Reminder

**Quality is not negotiable. Thoroughness is not optional.**

When building AutoMechanica, you are building software that real customers will use to buy parts for their vehicles. Bugs could mean:
- Wrong parts shipped (customer frustration, returns, lost money)
- Security vulnerabilities (data breaches, legal liability)
- Performance issues (slow site, lost sales)
- Maintenance nightmares (future developers can't understand code)

**Every task you complete thoroughly is one less problem in production.**

Take the time. Read carefully. Implement completely. Test thoroughly. Ship confidently.

---

*Last Updated: 2024-11-30*
*AutoMechanica Project*
