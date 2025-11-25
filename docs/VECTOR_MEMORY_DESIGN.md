# VECTOR_MEMORY_DESIGN.md

# AutoMechanica — Vector Memory System Design

This document defines the design, purpose, schemas, and operational rules for the AutoMechanica Vector Memory subsystem.  
Codex must follow this specification precisely when implementing embedding storage, retrieval, and memory-augmented reasoning.

The Vector Memory system allows agents to learn from past decisions, avoid repeating mistakes, and ground their responses in historical patterns.

---

# 1. Purpose of Vector Memory

Vector memory is used for:

- Fitment reasoning  
- Supplier reliability comparison  
- Pricing context  
- SEO grounding  
- Error correction  
- Similar-case recall  
- Long-term pattern detection  

Memory is stored as vector embeddings via **pgvector** in Postgres during MVP.  
Later phases may support **Qdrant** as an external high-performance search engine.

---

# 2. Architecture Overview

The memory system consists of:

1. **embedding_jobs table** – schedules embedding creation  
2. **embedding worker** – processes jobs asynchronously  
3. **vector tables** – store embeddings  
4. **memory API** – helpers to query memory  
5. **LLM Router integration** – contextual retrieval for agents  

---

# 3. Embedding Job Pipeline

Agents never write embeddings directly.  
Instead, for each AgentEvent:

1. Agent writes **AgentEvent** row  
2. System creates **embedding_job** entry:

```
{
  id,
  target_type: "agent_event",
  target_id: event.id,
  status: "pending"
}
```

3. Embedding worker:
   - Fetches pending jobs
   - Generates embedding using selected embedding model
   - Writes vector row to appropriate table
   - Marks job as completed

This ensures:
- No blocking
- No heavy LLM calls in agent execution path
- Consistent batching

---

# 4. Embedding Model

Default embedding model (MVP):

`text-embedding-3-large` (OpenAI)

Later options:
- `text-embedding-3-small`
- Local embeddings via Llama or Nomic
- Qdrant HNSW search

---

# 5. Memory Collections (Vector Tables)

AutoMechanica uses **three primary vector collections:**

---

## 5.1 agent_event_embeddings

Stores embeddings representing agent reasoning events.

**Schema:**

| Column | Type |
|--------|------|
| id | UUID PK |
| event_id | UUID FK → agent_events.id |
| embedding | VECTOR |
| metadata | JSONB |
| created_at | TIMESTAMP |

**Usage:**
- Recall similar reasoning patterns
- Detect repeated mistakes
- Improve fitment/policy decisions

---

## 5.2 part_embeddings

Stores embeddings for canonical parts.

**Schema:**

| Column | Type |
|--------|------|
| id | UUID PK |
| part_id | UUID FK → parts.id |
| embedding | VECTOR |
| metadata | JSONB |
| created_at | TIMESTAMP |

**Usage:**
- Similar part detection  
- Attribute comparison  
- Canonical part mapping  
- SEO grounding  

---

## 5.3 fitment_issue_embeddings

Stores embeddings for past misfit or conflict cases.

**Schema:**

| Column | Type |
|--------|------|
| id | UUID PK |
| issue_event_id | UUID FK → agent_events.id |
| embedding | VECTOR |
| metadata | JSONB |
| created_at | TIMESTAMP |

**Usage:**
- Fitment anomaly detection  
- Confidence reduction from historical patterns  
- Vehicle-specific edge-case identification  

---

# 6. Memory Query API

Each collection exposes:

```
search_embeddings(
    collection,
    query_vector,
    k=10,
    filters={}
) → [ { id, score, metadata } ]
```

Features:
- Cosine similarity by default
- Optional filters:
  - vehicle_id
  - part_id
  - agent_name
  - timestamp ranges

---

# 7. Agent Memory Usage Patterns

### 7.1 Fitment Agent
Uses:
- Similar past fitment decisions  
- Past misfits  
- Part attribute memory  

Benefits:
- Avoid repeating incorrect mappings  
- Improve confidence estimation  

---

### 7.2 Pricing Agent
Uses:
- Price patterns  
- Supplier reliability embeddings  
- Competitor pricing memory  

---

### 7.3 SEO/Content Agent
Uses:
- Past high-performing descriptions  
- Similar part embeddings for tone consistency  

---

### 7.4 Orchestrator
Uses:
- Historical workflow success patterns  
- Policy improvement guidance  

---

# 8. Embedding Worker Design

Worker performs:

1. SELECT pending jobs  
2. Generate embedding  
3. Insert into vector table  
4. Update job → completed  

Error handling:
- Retry with backoff  
- Move to `failed` after MAX_ATTEMPTS  
- Log error for Analytics Agent  

---

# 9. Migration to Qdrant (Phase 6+)

When scaling up:

- Move vector tables to Qdrant collections  
- Enable HNSW indexing for fast similarity search  
- Maintain Postgres as fallback metadata store  
- Add QdrantAdapter to memory API  

---

# 10. Security & Privacy

Vector memory stores **only system-generated content**, NOT raw customer data.

Allowed:
- part attributes  
- supplier info  
- agent reasoning summaries  

Prohibited:
- PII  
- customer messages  
- addresses  

---

# 11. Testing Requirements

Codex must implement tests for:

- embedding_jobs lifecycle  
- embedding worker logic  
- vector table creation  
- similarity search correctness  
- memory API handling null cases  
- indexing performance  

---

# End of VECTOR_MEMORY_DESIGN.md
