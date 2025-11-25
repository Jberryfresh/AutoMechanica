# MAIN_PLAN.md

# AutoMechanica — Master System Plan  
A Fully Autonomous, AI‑Driven Car Parts Dropshipping Platform

---

## 1. Vision & Strategy

AutoMechanica is a fully automated car‑parts dropshipping platform powered by a network of coordinated AI agents. It operates like a digital parts warehouse with a brain:  
- It ingests supplier catalogs.  
- Normalizes part data.  
- Creates canonical part records.  
- Maps fitment (“what cars does this part fit?”).  
- Prices and writes SEO‑friendly product descriptions.  
- Publishes products to the store.  
- Assists customers with an AI Support Agent.  

The system is built to scale, fully modular, and future‑proof, using a task‑queue architecture, workflow orchestrator, and multi‑model LLM routing.

---

## 2. High-Level Architecture Overview

AutoMechanica consists of 10 major subsystems:

### 2.1 Backend Core (TypeScript)
- API layer  
- Database layer (Postgres + JSONB + pgvector)  
- Models and domain logic  
- Task queue + worker system  
- Orchestrator + workflows  
- Vector memory module  
- LLM Router module  

### 2.2 Frontend (React + Tailwind)
- Vehicle selector & garage  
- Category pages  
- Product detail pages  
- Fitment UX  
- Support chat widget  

### 2.3 AI Agents
- SupplierNormalizationAgent  
- ProductDataAgent  
- FitmentAgent  
- PricingAgent  
- SEOAgent  
- SupportAgent  

### 2.4 Databases
- Postgres for relational storage  
- pgvector for embedding search  
- (Optional future) Qdrant for large‑scale vector memory  

---

## 3. Core Data Model

The canonical domain of AutoMechanica includes:

### 3.1 Vehicle Model
Represents specific vehicles:
- year  
- make  
- model  
- trim  
- engine  

### 3.2 Canonical Part
Clean, normalized, universal representation of a part.

### 3.3 Supplier Parts
Raw supplier rows (e.g. CSV, API results) that need cleaning and mapping.

### 3.4 Fitments
Links canonical parts → vehicles, with:
- confidence score  
- evidence JSON  
- source attribution  

### 3.5 Orders & Order Lines
Minimal commerce backend to support checkout.

### 3.6 Workflows & Agent Events
For orchestration, observability, memory, and evaluation.

---

## 4. Functional Overview

### 4.1 Supplier Catalog Ingestion
Workflow: `wf_ingest_supplier_catalog`  
- Ingest supplier raw feed  
- Normalize → map → fit → price → SEO content  
- Publish canonical parts  

### 4.2 Vehicle-Aware Browsing
User selects vehicle → entire site adapts:
- Category pages filter by fitment  
- Product detail shows “Fits Your Vehicle?” badge  
- Reverse-fitment table lists all compatible vehicles  

### 4.3 Support Agent
Handles:
- “Does this fit my car?”  
- “What’s the difference between pads A and B?”  
- General customer questions  

Uses safety rules in `SUPPORT_POLICY.md`.

---

## 5. AI System Design

### 5.1 LLM Router
Routes different tasks to different LLM providers:
- OpenAI (structured tasks, embeddings, reasoning)  
- Anthropic (long-context reasoning, safety)  
- Local/Ollama (cheap batching / fallbacks)  

Each TaskType chooses its provider automatically.

### 5.2 Vector Memory
Stores:
- Agent reasoning embeddings  
- Supplier → Canonical part matching vectors  
- Fitment explanation embeddings  

Built on pgvector with optional Qdrant integration.

### 5.3 Evaluations
- Fitment accuracy harness  
- Pricing sanity checks  
- SEO content quality filters  
- Safety filters for Support Agent  

---

## 6. Workflow Orchestration

### 6.1 Orchestrator
Controls:
- Workflow lifecycle  
- Task scheduling  
- Error handling  
- Backoff & retries  
- Logging into `agent_events`  

### 6.2 Workflows
- `wf_ingest_supplier_catalog`  
- `wf_publish_new_part`  
- Future workflows (order processing, RMA, etc.)

### 6.3 Task Queue
Implements:
- Leasing  
- Backoff  
- Dead-letter queue  
- Worker loop  

---

## 7. MVP Scope

### 7.1 Back-End MVP
- Vehicle + Parts + SupplierParts + Fitments + Orders + Workflows schema  
- Basic API layer  
- Supplier ingestion workflow  
- FitmentAgent (MVP rules + LLLM fallback)  
- PricingAgent (simple margin rules)  
- SEOAgent (Voice & Brand rules)  
- SupportAgent (contextual responses)  
- LLM Router (OpenAI + Anthropic + Local)  
- Vector memory (pgvector)  

### 7.2 Front-End MVP
- Vehicle picker + garage  
- Category browse (filtered by vehicle)  
- Product detail w/ fitment badge  
- Specs table  
- Reverse fitment table  
- SEO description  
- Add to cart + simple order placement  
- Support chat widget  

### 7.3 Evaluation MVP
- Fitment gold dataset harness  
- Confidence thresholds baseline  

---

## 8. Future Enhancements (Post-MVP)

- Full Qdrant integration as memory backend  
- Automated supplier API sync  
- Automated price updates  
- Advanced order processing workflow  
- Admin dashboard with analytics  
- Customer accounts + saved garage  
- Full marketplace API support (Amazon/eBay/Walmart listing agents)  
- Image generation for missing product photos  
- Rich SEO content (FAQs, comparisons, long-form)  

---

## 9. Non-Goals (for now)
- Full eCommerce suite (tax, shipping labels, refunds)  
- Vendor management portal  
- Real-time inventory sync with dozens of suppliers  
- Complex multi-node scaled distribution  
These are possible later, but out of scope for MVP.

---

## 10. Definition of Success

AutoMechanica MVP is successful when:

- Supplier feed → canonical parts → pricing → descriptions → fitment is fully automated  
- A user can:
  - Select a vehicle  
  - Browse valid parts  
  - See clear fitment badges  
  - View reverse fitment table  
  - Read SEO description  
  - Place a simple order  
  - Ask Support Agent questions  
- Fitment evaluation harness yields meaningful accuracy metrics  
- System is fully documented and can be extended by Codex autonomously  

AutoMechanica becomes a complete, intelligent, self-growing automotive parts platform.

---

# End of MAIN_PLAN.md
