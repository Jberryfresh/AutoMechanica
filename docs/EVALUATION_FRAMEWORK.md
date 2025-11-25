# EVALUATION_FRAMEWORK.md

# AutoMechanica — Evaluation & Quality Framework

This document defines the complete testing, validation, evaluation, and quality‑assurance strategy for the AutoMechanica multi‑agent system.  
Codex must implement the test scaffolding, evaluation logic, and quality gates exactly as described here.

The purpose of this framework:  
**Ensure accuracy, safety, reliability, fitment correctness, and long‑term system quality.**

---

# 1. Purpose of the Evaluation Framework

AutoMechanica is a high‑stakes system because:
- Fitment errors cost money  
- Pricing mistakes cost margin  
- SEO hallucinations damage trust  
- Agent failures break workflows  

Therefore, evaluation is multi‑layered and continuous.  
The framework covers:

- Fitment validation tests  
- Pricing accuracy checks  
- SEO/content quality checks  
- Workflow simulation tests  
- Agent reliability metrics  
- Shadow-mode testing for new logic  
- Human‑in‑the‑loop review processes  

---

# 2. Evaluation Categories

### 2.1 Fitment Accuracy  
Most important evaluation dimension. The system must:
- Minimize false positives (incorrect “fits”)  
- Detect edge-case trim/engine mismatches  
- Identify misfit patterns using vector memory  

### 2.2 Pricing Accuracy  
Pricing must:
- Stay competitive  
- Maintain margins  
- Avoid extreme outliers  
- Pass business constraints  

### 2.3 Content Quality  
SEO/Content Agent must:
- Produce factual descriptions  
- Follow Brand & Voice Guide  
- Avoid unverified claims  

### 2.4 Agent Reliability  
Measure:
- Task success rate  
- Error types  
- Latency  
- Token cost  
- Model-selection correctness  

### 2.5 Workflow Stability  
Ensure:
- No infinite loops  
- No stalled workflows  
- No duplicate tasks  
- Retry logic works properly  

---

# 3. Gold Datasets

Gold datasets are manually curated examples used to test agents.

## 3.1 Fitment Gold Set

Each entry defines a scenario:

```
{
  "fitment_id": "f001",
  "vehicle": { "year": 2015, "make": "Honda", "model": "Civic", "trim": "EX", "engine": "1.8L" },
  "canonical_part_id": "pad123",
  "expected_fit": true,
  "notes": "Verified OEM-equivalent match."
}
```

Gold set includes:
- True fits  
- True non‑fits  
- Edge-case trims  
- Conflicting supplier data  
- Historical misfit cases  

Used to test Fitment Agent end‑to‑end.

---

## 3.2 Pricing Gold Set

Example:

```
{
  "scenario_id": "p001",
  "canonical_part_id": "rotor456",
  "supplier_offers": [
    { "cost": 40, "lead_time": 2, "reliability": 0.95 },
    { "cost": 29, "lead_time": 7, "reliability": 0.60 }
  ],
  "market_prices": [74.99, 79.99],
  "expected_range": { "min": 65, "max": 90 }
}
```

Validation:
- Price must be within expected_range  
- Must obey margin and safety rules  

---

## 3.3 SEO Gold Set

Defines:
- Required keywords  
- Forbidden phrases  
- Tone structure  
- Readability targets  

Example:

```
{
  "required": ["ceramic", "front", "fits 2014-2016 Honda Civic"],
  "forbidden": ["OEM", "lifetime guarantee"],
  "min_readability_score": 55
}
```

---

# 4. Metrics Infrastructure

Evaluation metrics must be stored in:

**`evaluation_metrics` table:**

| Column | Type |
|--------|------|
| id | UUID |
| category | TEXT | fitment, pricing, seo, agent, workflow |
| metric | TEXT |
| value | FLOAT |
| metadata | JSONB |
| created_at | TIMESTAMP |

Analytics Agent generates summary reports.

---

# 5. Testing Layers

AutoMechanica has **4 layers of testing**.

---

## 5.1 Unit Tests

Cover:
- Domain model validation  
- Fitment rule engine  
- Pricing sanity checks  
- Task queue logic  
- Vector memory helpers  

Test framework: **Jest** or **Vitest**

---

## 5.2 Agent Harness Tests

Each agent has a simulation harness.

Input → agent → expected structured output.

Examples:
- FitmentAgent: must output confidence + reasoning + vehicle list  
- PricingAgent: must output price + justification  
- SupplierNormalization: must produce stable normalized attributes  

Harness tests validate:
- Schema correctness  
- Deterministic outputs  
- No hallucinated fields  

---

## 5.3 Workflow Simulation Tests

Full end‑to‑end simulations:

### `wf_ingest_supplier_catalog`
Validates:
- Supplier ingestion  
- Normalization  
- Part mapping  
- Fitment generation  
- Content & pricing steps  

### `wf_process_customer_order`
Validates:
- Fitment re-check  
- Supplier selection  
- Pricing update  
- Task creation sequence  
- Workflow success  

---

## 5.4 Shadow Mode (Production‑Safe Testing)

Before deploying major updates:

- Orchestrator runs workflows in *shadow-mode*  
- Results do NOT affect production  
- Differences are compared to live workflow decisions  

Use cases:
- New LLM prompts  
- New fitment logic  
- New pricing strategy  
- New agent versions  

---

# 6. Fitment Evaluation Logic

Fitment accuracy = **# correct fitment decisions / total fitment decisions**

But broken down:

### 6.1 False Positives (Critical)
System says “fits”, reality says NO.  
This is the most expensive type of error.

### 6.2 False Negatives
System says “does not fit”, but it actually fits.  
Less expensive, but affects customer experience.

### 6.3 Confidence Calibration
Confidence scores should match real‑world behavior.

Example:
- High confidence group (≥ 0.9) should have near‑zero misfits  
- Medium confidence group (0.75–0.9) acceptable low error rate  

Vector memory is used to detect:
- common edge-case vehicles  
- patterns of repeated misfit  
- supplier‑specific issues  

---

# 7. Pricing Evaluation Logic

Metrics include:

- Average margin  
- Margin violations  
- Undervalued price detection  
- Overpricing outliers  
- Competitiveness vs market average  

Rules:
- Price must not fall below cost + minimum margin  
- Must stay within expected_range in gold test set  
- Must avoid wildly undercutting competitors  
- Logs reasoning summaries  

---

# 8. Content Evaluation Logic

Content must:
- Follow Brand & Voice guidelines  
- Match required keywords  
- Avoid forbidden phrases  
- Meet readability threshold  
- Contain correct factual details  

Automated checks include:
- Keyword scanner  
- JSON structure validation  
- Reading ease score  
- Pattern-matching for forbidden claims  

---

# 9. Agent Reliability Metrics

Track:

- error_rate per agent  
- avg latency  
- token cost  
- fallback usage  
- schema validation failures  
- dead tasks created  
- workflow halts caused  

AnalyticsAgent generates daily trends.

---

# 10. Human-in-the-Loop Review

## 10.1 Fitment Review Queue

Any fitment with:
- confidence < 0.75  
- conflicting data sources  
- past misfits in similar vectors  

→ routed to a human reviewer.

Required reviewer actions:
- confirm fitment  
- adjust confidence  
- leave reviewer note  

---

## 10.2 Content Review Queue

Used for:
- premium parts  
- high-traffic pages  
- flagged content  
- brand-sensitive descriptions  

Reviewers can approve or request rewrite.

---

# 11. UI Indicators of Evaluation State

Frontend should display:

- Fitment badges (Guaranteed / Likely / Verify)  
- Pricing stability indicator if uncertain  
- SEO quality checkmarks in admin  
- Workflow completion results in admin panel  

---

# 12. Test Automation Requirements

Codex must implement:
- CI pipeline for running all tests  
- Coverage thresholds (≥ 80%)  
- Linting + typing checks  
- Automated dataset-based test suites  
- Simulation environment  

---

# 13. Long-Term Evaluation Loop

System continuously improves by:

- Storing AgentEvents  
- Embedding them  
- Using similarity search for new cases  
- Adjusting confidence based on misfit patterns  
- Orchestrator enforcing policy evolution  

This forms AutoMechanica’s self‑correcting intelligence.

---

# End of EVALUATION_FRAMEWORK.md
