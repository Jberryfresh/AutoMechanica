# CODE_STYLE_AND_CONVENTIONS.md

# AutoMechanica — Code Style & Conventions Guide

This document establishes the official coding standards, conventions, and structural rules for the AutoMechanica repository.  
Codex must adhere strictly to this guide when generating or modifying code.

The goal:  
**A clean, consistent, maintainable TypeScript codebase with predictable file structure and high developer clarity.**

---

# 1. Language & Framework Standards

### **1.1 Language**
- TypeScript **only**
- No JavaScript files in the backend
- React components use `.tsx`

### **1.2 Backend Framework**
- Node.js (LTS)
- Express or lightweight framework (Codex may scaffold either)
- Strong typing everywhere

### **1.3 Frontend Framework**
- React + TailwindCSS
- Next.js OR Vite + React Router (either is allowed)
- Components must follow BRAND_GUIDE.md and FRONTEND_UX_SPEC.md

---

# 2. Folder Structure

```
/backend
  /src
    /api
    /agents
    /orchestrator
    /queue
    /llm
    /memory
    /models
    /workflows
    /utils
  /tests
/frontend
  /src
    /components
    /pages
    /hooks
    /utils
  /tests
/docs
/scripts
```

Notes:
- All domain logic goes inside `/backend/src`
- `/docs` contains this document pack
- `/scripts` holds tooling, seeding scripts, etc.

---

# 3. TypeScript Conventions

### **3.1 Strict Mode**
`"strict": true` must be enabled in tsconfig.

### **3.2 No `any`**
Unless absolutely unavoidable:
- Use `unknown`
- Use generics
- Use proper interfaces

### **3.3 Naming Conventions**
- Files: `kebab-case`
- Interfaces: `PascalCase`
- Types: `PascalCase`
- Variables/functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### **3.4 Imports**
- Absolute imports allowed via tsconfig paths
- Group imports:
  - Built-in
  - External libs
  - Internal modules

---

# 4. Backend Conventions

### **4.1 API Routes**
Structure:

```
/api/v1/vehicles
/api/v1/parts
/api/v1/orders
```

Use REST conventions:
- GET (read)
- POST (create)
- PUT/PATCH (update)
- DELETE (delete)

### **4.2 Models & Migrations**
- Database models defined in `/models`
- Migrations generated via tool (Knex/Prisma/etc.)
- Follow DOMAIN_MODEL.md exactly

### **4.3 Orchestrator & Agents**
- All agents must implement:
```
runTask(task): Promise<TaskResult>
```

- Orchestrator must:
  - Read workflow definition
  - Decide next task
  - Apply policy

### **4.4 Task Queue**
- Queue worker loops must use async generators if possible
- Leases must be extended periodically
- Follow TASK_QUEUE_SPEC.md

---

# 5. Frontend Conventions

### **5.1 Components**
- Must be functional components
- No class components
- Use TailwindCSS for styling
- Use BRAND_GUIDE.md for spacing/layout
- Components should be small & reusable

### **5.2 State Management**
- Use React hooks
- Lift state when necessary
- Avoid global state unless justified

### **5.3 Accessibility**
- ARIA roles required for interactive elements
- Keyboard navigation must work everywhere
- Must adhere to WCAG AA

---

# 6. Testing Requirements

### **6.1 Backend Testing**
- Use Jest or Vitest
- Cover:
  - queue logic
  - orchestrator logic
  - workflow simulations
  - agent harness tests
  - memory API tests

### **6.2 Frontend Testing**
- Use React Testing Library + Vitest/Jest
- Test:
  - fitment badges
  - vehicle picker
  - reverse fitment table
  - search behavior
  - cart/checkout logic

### **6.3 Coverage**
- 80% minimum
- Critical modules must reach 90%

---

# 7. Documentation Expectations

Codex must automatically generate & update:

- `INSTALLATION.md`
- `DEPLOYMENT.md`
- `API_REFERENCE.md`
- `CODE_STYLE_AND_CONVENTIONS.md` (this file)

Every PR that changes behavior must update relevant docs.

---

# 8. Git & PR Standards

### **8.1 Branch Naming**
```
feature/<desc>
fix/<desc>
chore/<desc>
```

### **8.2 Commit Requirements**
- Clear summary
- Describe change, not file
- Include task ID if referencing TODO.md

### **8.3 PR Requirements**
- Link to task in TODO.md
- Tests must pass
- Include screenshots for UI changes

### **8.4 Git Hooks & Commit Hygiene**
- Husky pre-commit hooks run `lint-staged` to auto-format and lint staged TypeScript/React files.
- Commit messages must follow Conventional Commits (`type(scope): summary`).
- To bypass hooks in emergencies, use `HUSKY=0 git commit` (not recommended; fix the issue instead).
- Run `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` before opening a PR.

---

# 9. Linting & Formatting

### **Required Tools**
- ESLint
- Prettier

Rules:
- 2-space indentation
- Semicolons required
- Single quotes
- Trailing commas allowed

---

# 10. Performance Rules

- Avoid unnecessary deep renders
- Cache expensive computations
- Minimize large LLM calls
- Use pagination for large lists
- Use lazy-loading for images

---

# 11. Security Conventions

- Never log secrets
- Never embed LLM API keys in frontend
- Backend must verify all requests
- Validate all user input
- Escape user-provided content
- Use HTTPS in production

---

# 12. Future Upgrades (Phase 6+)

- Adopt tRPC + Zod for type-safe APIs
- Add WebSockets for workflow monitoring
- Add more aggressive caching layers
- Add Qdrant memory backend

---

# End of CODE_STYLE_AND_CONVENTIONS.md
