# ARCHITECTURE_OVERVIEW.md

AutoMechanica System Architecture Overview

This document provides a high‑level, engineering‑focused overview of the entire AutoMechanica architecture, including system components, data flow, services, and integration boundaries.

---

## 1. System Overview

AutoMechanica is built as a modular, service‑oriented system composed of:

- **Frontend Application (React + Tailwind)**
- **Backend API (TypeScript)**
- **Multi‑Agent Backend**
  - Orchestrator service
  - Specialized agent workers
  - Task queue
  - Vector memory
  - LLM router
  - Embedding worker
- **Postgres Database (+ pgvector extension)**
- **File storage** (for images, logs, exports — optional future)

All components communicate through well‑defined interfaces and follow a predictable flow:  
**Workflows → Tasks → Agents → Decisions → Memory → Frontend responses.**

---

## 2. High‑Level Architecture Diagram (ASCII)

```
                     ┌─────────────────────┐
                     │     Frontend UI     │
                     │  React + Tailwind   │
                     └──────────┬──────────┘
                                │ REST/HTTPS
                                ▼
                     ┌─────────────────────┐
                     │     Backend API     │
                     │  TypeScript (Node)  │
                     └──────────┬──────────┘
                                │ Issues workflows
                                ▼
                     ┌─────────────────────┐
                     │     Orchestrator    │
                     │  Workflow Manager   │
                     └──────────┬──────────┘
                  Generates tasks for agents
                                ▼
                     ┌─────────────────────┐
                     │      Task Queue     │
                     │   Postgres-backed   │
                     └───────┬────────────┘
           Agent workers pull│leased tasks
                             ▼
        ┌───────────────────────────────┐
        │           Agent Pool          │
        │ Fitment | Pricing | SEO | ... │
        └─────────────────────┬─────────┘
                              │ Writes decisions
                              ▼
                     ┌─────────────────────┐
                     │     Agent Events    │
                     │  + Vector Embeds    │
                     └──────────┬──────────┘
                                │ Query memory
                                ▼
                     ┌─────────────────────┐
                     │    Vector Memory    │
                     │ (pgvector → Qdrant) │
                     └─────────────────────┘
```

---

## 3. Backend Subsystems

### 3.1 Orchestrator Service
Central controller of all autonomous workflows:
- Runs workflow definitions
- Applies policies (confidence thresholds, safety checks, retries)
- Creates tasks for agents
- Reads results + updates workflow state
- Logs decisions as AgentEvents

### 3.2 Agent Workers
Individual services performing specialized tasks:
- FitmentAgent
- PricingAgent
- SupplierNormalizationAgent
- ProductDataAgent
- SEOAgent
- OrderAgent
- AnalyticsAgent
- SupportAgent

Workers:
- Pull tasks from queue
- Run logic + LLM reasoning via Router
- Persist structured results + decision summaries

---

## 4. Task Queue Architecture

The Postgres‑backed queue ensures:

- Safe, atomic leasing (FOR UPDATE SKIP LOCKED)
- Retries with exponential backoff
- Dead‑letter queue for failures
- Priority‑based task selection
- Parallel worker scaling
- Deterministic task lifecycle:
  - PENDING → LEASED → RUNNING → COMPLETED | FAILED | DEAD

---

## 5. LLM Router Layer

A provider‑agnostic layer for:
- Model selection based on task complexity & cost
- Automatic fallbacks on provider outages
- Routing across:
  - OpenAI GPT‑4.1 / GPT‑4.1‑mini
  - Anthropic Claude Sonnet / Haiku
  - Local models (Ollama)
  - Future: Gemini, Mistral, etc.

The router logs:
- modelUsed
- tokens
- latency
- cost estimate
- fallback events

---

## 6. Vector Memory System

pgvector‑powered memory for:
- agent_event_embeddings
- part_knowledge_embeddings
- fitment_issue_embeddings
- supplier_doc_embeddings

Memory enables:
- Similar‑case retrieval
- Fitment error pattern detection
- SEO grounding
- Pricing comparison
- Supplier policy lookup

Workers asynchronously build embeddings via embedding_jobs.

---

## 7. Database Architecture

Postgres schema includes:

### Core tables:
- vehicles
- parts
- supplier_parts
- fitments

### Operational tables:
- tasks
- workflows
- agent_events
- embedding_jobs

### Vector tables (pgvector):
- event_embeddings
- part_embeddings
- issue_embeddings

All tables follow explicit indexing rules for speed + reliability.

---

## 8. Frontend Architecture

React + Tailwind webapp with:
- Vehicle picker (Garage)
- Vehicle‑aware browsing
- Canonical product pages
- Fitment badges
- Reverse fitment lists
- “Why this fits” agent explanation modal
- Support chat integration

All API calls flow through Backend API → Orchestrator → Agents.

---

## 9. Deployment Overview (MVP)

Initial deployment target:
- Single VPS or container host
- Services:
  - Backend API
  - Agent workers (multi‑process)
  - Embedding worker
  - Postgres + pgvector
  - Frontend build served by backend or CDN

Future phases add:
- Redis
- Qdrant
- Autoscaling worker fleet
- CI/CD pipeline

---

## 10. Extensibility

AutoMechanica is built to scale with:
- Additional agent roles
- More suppliers
- Additional product categories
- Real‑time pricing + inventory sync
- VIN decoding
- Neo4j graph layer (optional Phase 6+)
