# LLM_ROUTER_SPEC.md

# AutoMechanica — LLM Router Specification

This document defines the complete rules, interfaces, routing logic, safety constraints, fallback behavior, and implementation structure for the AutoMechanica LLM Router.  
Codex must follow this exactly when building the provider‑agnostic reasoning layer of the system.

The LLM Router is a central subsystem:  
**All agents call LLMs *only* through this router.**

---

# 1. Purpose of the Router

The LLM Router:

- Selects the appropriate model for each task  
- Enforces safety policies  
- Handles fallback logic  
- Logs usage (cost/tokens/provider)  
- Normalizes request/response formats  
- Enables swapping LLM providers without changing agent code  

---

# 2. Supported Model Providers (MVP)

The Router will support the following providers at launch:

### **2.1 OpenAI**
- `gpt-4.1`
- `gpt-4.1-mini`

### **2.2 Anthropic**
- `claude-3-5-sonnet`
- `claude-3-5-haiku`

### **2.3 Local Models (Ollama)**
- `llama3`
- `mistral`
- others if configured

Future providers can be added via adapter modules.

---

# 3. Task Classification

Every LLM call is categorized into a **TaskType**, which determines routing rules.

| TaskType | Description | Examples |
|----------|-------------|----------|
| `meta_reasoning` | Orchestrator internal thinking | workflow planning |
| `fitment_analysis` | Fitment logic, conflicting data resolution | Fitment Agent |
| `pricing_reasoning` | Market analysis, margin reasoning | Pricing Agent |
| `seo_generation` | Product descriptions | SEO Agent |
| `support_reply` | Support Agent communication | chat-style |
| `normalization` | Attribute extraction and mapping | Supplier Normalization |
| `matching` | Part matching, similarity | Product Data Agent |
| `lightweight` | Simple classification | brand cleanup |
| `safety_check` | High‑stakes verification tasks | final fitment checks |

---

# 4. Model Selection Rules (Routing Logic)

The Router chooses models based on:

- Complexity of task  
- Safety level  
- Latency requirements  
- Cost requirements  
- Context length required  

---

## 4.1 Model Preference Table

### **Tier 1 (High‑Precision / High‑Trust)**  
Use for:  
- fitment_analysis  
- pricing_reasoning  
- safety_check  
- complex matching  
- ambiguous supplier catalogs  

Preferred models:
- `gpt-4.1`  
- `claude-3-5-sonnet`

Fallbacks:
- `claude-3-5-haiku`
- `gpt-4.1-mini`

---

### **Tier 2 (Balanced Cost/Quality)**  
Use for:  
- meta_reasoning  
- normalization  
- attribute extraction  
- light reasoning tasks  

Preferred models:
- `gpt-4.1-mini`
- `claude-3-5-haiku`

Fallbacks:
- `llama3:latest` (local)

---

### **Tier 3 (Low Cost / High Frequency)**  
Use for:  
- seo_generation  
- support_reply  
- user chat flows  

Preferred:
- `claude-3-5-haiku`
- `gpt-4.1-mini`

Fallback:
- Local models (Ollama)

---

# 5. Routing Algorithm

The Router follows the algorithm below:

```
function routeLLM(taskType, payload):
    rules = ROUTING_TABLE[taskType]

    # 1. Choose preferred model
    for model in rules.preferred:
        if providerHealthy(model):
            return callModel(model, payload)

    # 2. Fallback models
    for model in rules.fallback:
        if providerHealthy(model):
            return callModel(model, payload)

    # 3. Hard fallback (local model)
    return callModel(localDefaultModel, payload)
```

---

# 6. Safety Rules

### 6.1 Fitment Safety  
For tasks involving fitment or safety‑critical components:
- Must use Tier 1 models  
- Require deterministic structured output  
- Must record reasoning  
- Must log confidence estimate  
- Must write AgentEvent entry  
- Must generate embedding_jobs entry  

### 6.2 Pricing Safety  
Pricing tasks must:
- Avoid unbounded price reductions  
- Check margin thresholds  
- Provide structured price justification  

### 6.3 Support Agent Safety  
Must adhere to VOICE_TONE_GUIDE rules.

---

# 7. Request Format (Standardized for All Providers)

```
{
  "taskType": "fitment_analysis",
  "input": { ... },
  "context": { ... },
  "instructions": "...",
  "temperature": 0.1,
  "max_tokens": 2048,
  "format": "json",
  "schema": { ... }   # optional JSON schema
}
```

The router transforms this into provider‑specific formats internally.

---

# 8. Response Format (Unified)

Every LLM response MUST follow:

```
{
  "output": { ... },    # structured result
  "reasoning": "...",   # summary (safe)
  "modelUsed": "claude-3-5-sonnet",
  "tokens": {
    "input": 0,
    "output": 0,
    "total": 0
  },
  "cost_estimate": 0.00,
  "timestamp": "ISO8601"
}
```

Codex must enforce this.

---

# 9. Logging Requirements

Router logs each call:

- modelUsed  
- provider  
- latency  
- token usage  
- fallback count  
- taskType  
- workflow_id (if applicable)  

Stored in database table:

**`llm_calls`**

With fields:
- id  
- model  
- task_type  
- cost  
- token_count  
- latency_ms  
- input_excerpt  
- created_at  

---

# 10. Error & Fallback Behavior

### 10.1 Provider Error  
If a model:
- times out  
- errors  
- rate‑limits  
- produces invalid JSON  

→ Automatically fallback to next model.

### 10.2 Invalid Output  
If output fails schema validation:
- Retry with same model (max 2 attempts)  
- Fallback to next model  

### 10.3 Hard Fail  
If all providers fail:
- Return `router_error`  
- Orchestrator may requeue task or escalate  

---

# 11. Local Model Handling

Local models are used for:
- SEO content  
- Low‑risk tasks  
- Bulk generation  
- Backfill tasks  

Local adapter must implement:
- streaming  
- JSON enforcement wrapper  
- retry logic  
- token estimation (approximation)

---

# 12. Extensibility

Codex must structure the router to easily add new providers by implementing:

```
class ProviderAdapter:
    def generate(self, input): ...
    def isHealthy(): ...
```

A new provider requires only:
- adapter implementation  
- routing table update  

---

# End of LLM_ROUTER_SPEC.md
