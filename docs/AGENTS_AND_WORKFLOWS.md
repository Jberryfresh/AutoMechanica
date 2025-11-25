# AGENTS_AND_WORKFLOWS.md

# AutoMechanica — Agents & Workflows Specification

This document defines every autonomous agent in the AutoMechanica ecosystem, their responsibilities, inputs, outputs, tools, and the workflows they participate in.

It is one of the core documents Codex must follow when constructing the multi-agent backend.

---

# 1. Overview

AutoMechanica uses a **multi-agent architecture** driven by:

- **Workflows** (process controllers)
- **Tasks** (unit of work)
- **Agents** (specialized workers)
- **Orchestrator** (policy brain)

Agents never call each other directly.  
They interact **only through**:
- Task queue  
- Orchestrator  
- Vector memory  
- Database tools  
- LLM Router  

This structure keeps the system transparent, debuggable, and scalable.

---

# 2. Agent Catalog

The system includes the following agents:

1. Orchestrator Agent  
2. Supplier Research Agent  
3. Supplier Normalization Agent  
4. Product Data Agent  
5. Fitment Agent  
6. Pricing Agent  
7. Inventory Agent  
8. SEO/Content Agent  
9. Order Agent  
10. Support Agent  
11. Analytics Agent  

Each agent is defined below with:

- Responsibilities  
- Inputs  
- Outputs  
- Required Tools  
- Memory Usage  
- Error Behavior  

---

# 3. Agent Definitions

---

## 3.1 Orchestrator Agent (Meta-Agent)

**Role:**  
The conductor of all system activity. It coordinates workflows, delegates tasks, controls failure handling, and enforces policy.

**Responsibilities:**
- Start workflows
- Create tasks
- Track workflow state
- Apply rules (thresholds, safety, confidence)
- Retry or escalate tasks
- Log events

**Input:**
- Workflow definition
- Current workflow context
- Agent task results
- Policy definitions

**Output:**
- Task creation commands
- Workflow updates
- Decision logs (AgentEvents)

**Tools:**
- Database
- TaskQueue
- Vector memory
- LLM router (for limited reasoning)

**Notes:**
- Typically uses small, cheap LLMs for meta-reasoning.

---

## 3.2 Supplier Research Agent

**Role:**  
Fetches raw supplier data from external sources.

**Responsibilities:**
- Parse supplier data feed  
- Extract items  
- Validate payload schemas  

**Input:**
- supplier_id  
- API endpoints or CSV/JSON data  

**Output:**
- Raw `supplier_parts` rows  

**Tools:**
- HTTP fetch tool  
- File parser (CSV, XML, JSON)  

---

## 3.3 Supplier Normalization Agent

**Role:**  
Transform raw supplier data into structured, normalized form.

**Responsibilities:**
- Map supplier attributes → standard attribute dictionary  
- Normalize brand names  
- Validate mandatory fields  
- Identify duplicate SupplierParts  

**Input:**
- supplier_part raw_data  
- normalization schema  

**Output:**
- normalized_data (JSONB)  
- tentative canonical_part match suggestions  

**Tools:**
- Database  
- Vector memory for brand/attribute similarity  
- LLM Router  

**Notes:**
- Major contributor to catalog accuracy.

---

## 3.4 Product Data Agent

**Role:**  
Maps normalized SupplierParts to canonical Parts and creates new Parts when needed.

**Responsibilities:**
- Find existing canonical parts  
- Create new canonical parts  
- Sync attributes  
- Identify attribute conflicts  

**Input:**
- normalized SupplierPart  
- attribute dictionary  
- potential matches  

**Output:**
- canonical_part_id  
- part attributes update  

**Tools:**
- Database  
- LLM Router for attribute comparison  
- Vector memory  

---

## 3.5 Fitment Agent

**Role:**  
Determines which vehicles a part fits, assigns confidence scores, and stores evidence.

**Responsibilities:**
- Evaluate fitment candidates  
- Compare attributes to vehicle specs  
- Use memory to detect past misfits  
- Assign confidence score  
- Produce “fitment reasoning” summary  

**Input:**
- canonical_part_id  
- normalized_data  
- vehicle candidates  

**Output:**
- Fitment entries (vehicle_id, confidence, evidence)  

**Tools:**
- Database  
- LLM Router  
- Vector memory (fitment_issue_embeddings, part_embeddings)

**Confidence Rules:**
- ≥ 0.90 → Guaranteed Fit  
- 0.75–0.89 → Likely Fit  
- < 0.75 → Needs Verification  

---

## 3.6 Pricing Agent

**Role:**  
Determines final product pricing based on cost, competitive market rates, supplier reliability, and margin strategy.

**Responsibilities:**
- Gather market price comparisons  
- Apply margin rules  
- Choose optimal supplier cost  
- Avoid extreme underpricing/overpricing  
- Log pricing justification  

**Input:**
- cost
- category
- competitor prices
- fitment complexity
- inventory reliability

**Output:**
- final_price  
- pricing metadata (market ranges, margins, decisions)

**Tools:**
- HTTP fetch (for competitor prices)  
- Database  
- LLM Router  
- Analytics events  

---

## 3.7 Inventory Agent

**Role:**  
Maintain inventory-awareness across suppliers.

**Responsibilities:**
- Record inventory snapshots  
- Check availability  
- Update SupplierPart availability status  

**Input:**
- supplier inventory feed  
- order commitments  

**Output:**
- updated SupplierPart availability  
- alerts for low inventory  

---

## 3.8 SEO/Content Agent

**Role:**  
Generate high-quality product descriptions, category blurbs, SEO tags, and structured text for AutoMechanica.

**Responsibilities:**
- Produce factual, well-structured descriptions  
- Avoid hallucinated certifications  
- Format for readability  
- Follow brand voice rules  

**Input:**
- part attributes  
- fitment summary  
- brand voice rules  

**Output:**
- product description  
- category summaries  
- meta tags  

---

## 3.9 Order Agent

**Role:**  
Execute all backend logic for customer orders.

**Responsibilities:**
- Validate stock  
- Re-calculate fitment  
- Select supplier  
- Place supplier order  
- Handle partial success  
- Generate customer communication events  

**Input:**
- order_id  
- order lines  
- selected vehicle  

**Output:**
- order updates  
- supplier placement result  

---

## 3.10 Support Agent

**Role:**  
Provide customer assistance with fitment, returns, troubleshooting, and pre-checkout help.

**Responsibilities:**
- Answer fitment questions  
- Help identify brake type  
- Escalate low-confidence fits  
- Generate return instructions  
- Initiate human review if needed  

**Tone:**  
Follows VOICE_TONE_GUIDE.md rules.

---

## 3.11 Analytics Agent

**Role:**  
Tracks performance, identifies patterns, and provides insights.

**Responsibilities:**
- Generate daily/weekly metrics  
- Identify fitment errors  
- Track price competitiveness  
- Suggest workflow improvements  

---

# 4. Workflow Definitions

Workflows are orchestrated sequences of tasks.  
Agents participate asynchronously via the task queue.

---

# 4.1 Workflow: `wf_ingest_supplier_catalog`

**Purpose:** Update catalog based on fresh supplier feed.

### Steps:
1. Fetch supplier feed (Supplier Research Agent)  
2. For each item:  
   - Normalize (Supplier Normalization Agent)  
   - Match/create canonical part (Product Data Agent)  
   - Generate fitment (Fitment Agent)  
3. Trigger pricing workflow  
4. Trigger SEO content generation  
5. Mark workflow complete  

---

# 4.2 Workflow: `wf_publish_new_part`

**Purpose:** Publish a new canonical part fully.

### Steps:
1. Create canonical Part  
2. Run Fitment Agent  
3. Run Pricing Agent  
4. Run SEO/Content Agent  
5. Validate required fields  
6. Mark part ready for frontend  

---

# 4.3 Workflow: `wf_process_customer_order`

**Purpose:** End-to-end customer order processing.

### Steps:
1. Validate order inputs  
2. Re-check fitment for each item  
3. Select supplier  
4. Re-run Pricing Agent  
5. Place supplier order  
6. Update order status  
7. Generate fulfillment events  

---

# 4.4 Workflow: `wf_refresh_pricing`

### Steps:
1. Pull competitor pricing  
2. Re-evaluate margins  
3. Update Part pricing  
4. Log Analytics events  

---

# 4.5 Workflow: `wf_regenerate_content`

### Steps:
1. Fetch part  
2. Get embeddings  
3. Re-run SEO Agent  
4. Save new content  
5. Update timestamp  

---

# 5. Task Types

Examples of core task types:

- `fetch_supplier_feed`
- `normalize_supplier_part`
- `match_canonical_part`
- `generate_fitment`
- `calculate_pricing`
- `update_inventory`
- `generate_seo_content`
- `validate_order`
- `place_supplier_order`
- `support_interaction`
- `analytics_daily_run`

---

# 6. Memory Usage Patterns

Each agent may query:

- `agent_event_embeddings` to recall reasoning  
- `part_embeddings` to ground product data  
- `fitment_issue_embeddings` to reduce misfits  
- `workflow context` for meta decisions  

---

# 7. Logging Requirements

All agents must create AgentEvents containing:

- agent_name  
- task_type  
- input_data  
- output_data  
- reasoning_summary  
- timestamp  

Embedding jobs must be created for each AgentEvent.

---

# 8. Error Handling

Standard patterns:

- `retry_after_backoff`  
- `escalate_to_human`  
- `workflow_abort`  
- `task_requeue`  

Low-confidence critical tasks must route back to Orchestrator policy.

---

# End of AGENTS_AND_WORKFLOWS.md
