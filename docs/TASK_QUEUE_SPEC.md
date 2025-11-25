# TASK_QUEUE_SPEC.md

# AutoMechanica — Task Queue Specification

This document defines the task queue architecture for AutoMechanica.  
The queue is the backbone of all multi-agent activity.  
Codex must implement it exactly as described here.

---

# 1. Purpose

The Task Queue is a **Postgres-backed, durable, safe, scalable** distributed work queue that:

- Stores tasks created by the Orchestrator  
- Allows multiple agent workers to process tasks in parallel  
- Handles retries, backoff, and error escalation  
- Ensures no task is processed twice  
- Tracks state across workflow execution  

Every agent interacts with the system exclusively through tasks.

---

# 2. Task Table Schema

**Table: `tasks`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique task ID |
| workflow_id | UUID FK | Parent workflow |
| agent_name | TEXT | Target agent (e.g. “FitmentAgent”) |
| task_type | TEXT | e.g. “generate_fitment” |
| payload | JSONB | Task input |
| priority | INT | 0 = highest |
| status | TEXT | pending / leased / running / completed / failed / dead |
| attempts | INT | Retry counter |
| max_attempts | INT | Default 3 |
| available_at | TIMESTAMP | When the task becomes eligible |
| lease_owner | TEXT | Worker ID holding lease |
| lease_expires_at | TIMESTAMP | Lease expiry |
| error_info | JSONB | Last error |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

# 3. Task Lifecycle

```
pending
  ↓ (worker acquires lease)
leased
  ↓
running
  ↓ success
completed

running
  ↓ failure (attempts < max_attempts)
pending (with backoff)

running
  ↓ failure (attempts >= max_attempts)
dead
```

---

# 4. Leasing System (Critical)

To avoid duplicate work, workers use:

```
SELECT ...
FROM tasks
WHERE status = 'pending'
  AND available_at <= now()
ORDER BY priority, created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

Then:

- Set `lease_owner = worker_id`
- Set `lease_expires_at = now() + interval '30 seconds'`
- Update `status = 'leased'`

Worker must periodically heartbeat (extend lease) or task becomes eligible again.

---

# 5. Backoff Rules

When a task fails:

```
attempts = attempts + 1
available_at = now() + (attempts^2 * base_delay)
```

Example:

- attempt 1 → +5s  
- attempt 2 → +20s  
- attempt 3 → +45s  

If `attempts >= max_attempts`, move task to `dead`.

---

# 6. Worker Responsibilities

Each agent worker:

1. Polls queue  
2. Leases a task  
3. Runs logic  
4. Writes AgentEvent  
5. Creates embedding_job  
6. Updates task status  
7. Frees lease or marks complete  
8. Retries when needed  

Workers must identify themselves via:

```
worker_id = hostname + process_id
```

---

# 7. Task Priorities

0 = critical (fitment, order validation)  
1 = high (supplier normalization)  
2 = medium (pricing refresh, SEO refresh)  
3 = low (background analytics)

Lower number = higher priority.

---

# 8. Dead Letter Queue

Tasks with too many errors are moved to `status = 'dead'`.

All dead tasks are visible in admin UI with:

- error message  
- agent_name  
- task_type  
- input payload  
- attempts  

Orchestrator may later revive dead tasks manually.

---

# 9. Orchestrator → Queue Interaction

Orchestrator always creates tasks using structured definitions:

Example:

```
createTask({
  workflow_id,
  agent_name: "FitmentAgent",
  task_type: "generate_fitment",
  payload: {...},
  priority: 0,
  max_attempts: 3
})
```

Orchestrator updates workflow state based on:

- task completion  
- task failure thresholds  
- escalation logic  

---

# 10. Agent → Queue Interaction

Agents NEVER create tasks for unrelated agents.  
All cross-agent coordination is handled by Orchestrator.

Agents may:

- update task status  
- attach error_info  
- extend lease  
- mark complete  

---

# 11. Queue Metrics & Instrumentation

Store stats in `task_queue_metrics`:

- tasks_created  
- tasks_completed  
- tasks_failed  
- average_latency  
- worker_heartbeat_delay  
- error_rates_per_agent  

AnalyticsAgent reads these metrics daily.

---

# 12. Embedding Integration

When tasks complete:

- An AgentEvent is created  
- `embedding_jobs` entry created  
- Embedding worker picks it up asynchronously  

This enables memory enrichment for all agents.

---

# 13. Scaling

To scale up:

- Increase worker processes  
- Orchestrator is single-controller but stateless  
- Queue supports horizontal scaling across multiple machines  

---

# End of TASK_QUEUE_SPEC.md
