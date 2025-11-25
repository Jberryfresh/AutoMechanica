# DOMAIN_MODEL.md

# AutoMechanica — Domain Model Specification

This document defines the complete domain model for AutoMechanica.  
All backend schemas, migrations, API contracts, agents, workflows, and Codex implementations must follow this specification exactly.

---

# 1. Overview

The domain model represents the core automotive parts ecosystem:

- Vehicles
- Parts (canonical)
- SupplierParts (raw → normalized)
- Fitment (vehicle-to-part relationships)
- Orders
- Inventory
- Workflows
- Agent events (LLM reasoning + decisions)
- Embedding memory (pgvector)

Every table, entity, and relationship is documented here with the intention of complete clarity and zero ambiguity.

---

# 2. Entity Definitions

Below are the core entities in AutoMechanica's relational schema.

---

# 2.1 Vehicle

Represents a unique year/make/model/trim/engine combination.

**Table: `vehicles`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique vehicle identifier |
| year | INT | Model year |
| make | TEXT | Make (“Honda”) |
| model | TEXT | Model (“Civic”) |
| trim | TEXT | Trim (“EX”, “LX”) |
| engine | TEXT | Engine descriptor (“1.8L I4”) |
| created_at | TIMESTAMP | |

**Indexes:**
- `(year, make, model, trim, engine)` unique
- gin index on lower(make), lower(model)

---

# 2.2 Part (canonical)

A unique, vehicle-agnostic automotive part representation.

**Table: `parts`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Canonical part ID |
| name | TEXT | Human-readable name |
| category | TEXT | e.g., “brake_pads”, “rotors” |
| brand | TEXT | Brand/manufacturer |
| description | TEXT | SEO content (generated) |
| attributes | JSONB | Structured attribute set (position, material, etc.) |
| created_at | TIMESTAMP | |

**Notes:**
- Canonical parts are NOT vehicle-specific.
- Fitment determines which vehicles each part applies to.

---

# 2.3 SupplierPart

Raw or normalized part records from suppliers.

**Table: `supplier_parts`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| supplier_id | TEXT | “rockauto”, “wholesale_usa”, etc. |
| supplier_sku | TEXT | Supplier’s part ID |
| raw_data | JSONB | Original supplier payload |
| normalized_data | JSONB | Standardized attributes |
| canonical_part_id | UUID FK → parts.id (nullable) |
| cost | NUMERIC | Supplier cost |
| availability | TEXT | “in_stock”, “backorder”, etc. |
| lead_time_days | INT | |
| created_at | TIMESTAMP | |

**Indexes:**
- `(supplier_id, supplier_sku)` unique

---

# 2.4 Fitment

Defines which vehicles a part fits and includes validation/confidence.

**Table: `fitments`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| canonical_part_id | UUID FK → parts.id |
| vehicle_id | UUID FK → vehicles.id |
| confidence | FLOAT | 0.0–1.0 confidence score |
| evidence | JSONB | Source evidence + agent reasoning |
| source | TEXT | e.g., “supplier”, “database”, “AI-inferred” |
| created_at | TIMESTAMP | |

**Notes:**
- Multiple fitment entries per part allowed.
- Confidence regularly recalculated through workflows.

---

# 2.5 InventorySnapshot

Represents a point-in-time inventory read from a supplier.

**Table: `inventory_snapshots`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| supplier_part_id | UUID FK |
| quantity | INT |
| timestamp | TIMESTAMP |

---

# 2.6 Orders

Front-to-back customer order model.

**Table: `orders`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| user_id | UUID (nullable) | |
| status | TEXT | “pending”, “confirmed”, “fulfilled”, “cancelled” |
| total_amount | NUMERIC | |
| shipping_address | JSONB | |
| created_at | TIMESTAMP | |

---

# 2.7 OrderLine

Represents an individual part within an order.

**Table: `order_lines`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| order_id | UUID FK |
| canonical_part_id | UUID FK |
| quantity | INT |
| final_price | NUMERIC | Price after pricing agent sets value |
| fitment_confidence | FLOAT | Confidence at the moment of checkout |
| created_at | TIMESTAMP | |

---

# 2.8 Workflows

Tracks the state machine for any orchestrated workflow.

**Table: `workflows`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| type | TEXT | “process_order”, “ingest_supplier”, etc. |
| state | TEXT | “pending”, “running”, “completed”, “failed” |
| context | JSONB | Workflow-specific state data |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

# 2.9 AgentEvent

Stores every agent output, allowing memory + transparency.

**Table: `agent_events`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| workflow_id | UUID FK |
| agent_name | TEXT |
| task_type | TEXT |
| input_data | JSONB |
| output_data | JSONB |
| reasoning | TEXT | Agent thought summary |
| created_at | TIMESTAMP | |

---

# 2.10 Embedding Jobs

Tracks pending embedding tasks for the async worker.

**Table: `embedding_jobs`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK |
| target_type | TEXT | “agent_event”, “part”, “fitment_issue”, “supplier_doc” |
| target_id | UUID | |
| status | TEXT | “pending”, “processing”, “completed”, “failed” |
| created_at | TIMESTAMP | |

---

# 2.11 Vector Tables (pgvector)

Three main memory collections:

### `agent_event_embeddings`
- event_id (UUID FK)
- embedding (VECTOR)
- metadata (JSONB)

### `part_embeddings`
- part_id (UUID FK)
- embedding (VECTOR)
- metadata (JSONB)

### `fitment_issue_embeddings`
- issue_id (UUID PK or FK to agent_event.id)
- embedding (VECTOR)
- metadata (JSONB)

---

# 3. Relationships Summary

```
Vehicle ───────┐
                │ Fitment (confidence-based matching)
Part ───────────┘

SupplierPart → Part (normalized → canonical mapping)

Order → OrderLines → Part

Workflow → AgentEvents → (embedding_jobs → vector memory)
```

High-level rules:
- Vehicles never depend on parts.
- Canonical parts never depend on specific vehicles.
- Fitment links vehicles ↔ parts.
- SupplierParts map upward into canonical parts.
- AgentEvents power memory + transparency.
- Workflows coordinate multi-agent orchestration.

---

# 4. Attribute Dictionary

### Common part attributes stored under `parts.attributes`:

| Attribute | Type | Example |
|----------|------|----------|
| position | TEXT | “front”, “rear” |
| material | TEXT | “ceramic”, “semi-metallic” |
| rotor_type | TEXT | “vented”, “solid” |
| pad_type | TEXT | “ceramic”, “organic” |
| hardware_included | BOOLEAN | true |
| diameter_mm | INT | 262 |

---

# 5. Future Extensions

Phase 5+:
- VIN decoding tables  
- Neo4j graph integration  
- Real-time inventory sync  
- Multi-currency pricing  
- Supplier API auth & tokens  

---

# End of DOMAIN_MODEL.md
