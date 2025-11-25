# API_REFERENCE.md

# AutoMechanica — API Reference Documentation

This document defines *all backend REST API endpoints* for the AutoMechanica system.  
Codex must generate controllers, routers, handlers, schemas, and tests based on this specification.

This API follows predictable conventions:

- RESTful structure  
- `/api/v1/...` namespace  
- JSON-only  
- Strong input validation  
- Consistent error handling  
- Predictable success responses  

---

# 1. Base URL

```
/api/v1
```

---

# 2. Conventions

### Response Structure

All successful responses follow:

```
{
  "success": true,
  "data": { ... }
}
```

Errors follow:

```
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string",
    "details": { ... }
  }
}
```

---

# 3. Vehicle Endpoints

## 3.1 GET /vehicles

Returns all vehicles (paginated).

### Response:
```
{
  "success": true,
  "data": {
    "vehicles": [...],
    "pagination": {...}
  }
}
```

---

## 3.2 POST /vehicles

Create a new vehicle entry.

### Body:
```
{
  "year": 2015,
  "make": "Honda",
  "model": "Civic",
  "trim": "EX",
  "engine": "1.8L"
}
```

---

## 3.3 GET /vehicles/:id

Fetch a vehicle by ID.

---

## 3.4 DELETE /vehicles/:id

Deletes a vehicle.

---

# 4. Canonical Parts

## 4.1 GET /parts

Query canonical parts with filters.

Filters allowed:
- category  
- brand  
- position  
- price_min / price_max  

---

## 4.2 GET /parts/:id

Get a canonical part with:
- attributes  
- pricing  
- fitment summary  
- list of supported vehicles  
- SEO description  

### Example Response:

```
{
  "success": true,
  "data": {
    "part": { ... },
    "fitment_summary": [...],
    "vehicles": [...],
    "pricing": {...}
  }
}
```

---

## 4.3 POST /parts

Create a new canonical part (rare; mostly automated).

---

## 4.4 GET /parts/:id/fitment

Returns all fitment entries for a part.

---

# 5. Fitment Endpoints

## 5.1 GET /fitment/check

Checks fitment between a part and a vehicle.

### Query:
```
/fitment/check?partId=123&vehicleId=456
```

### Response:
```
{
  "success": true,
  "data": {
    "fits": true,
    "confidence": 0.92
  }
}
```

---

## 5.2 GET /fitment/vehicle/:vehicleId

Returns all parts that fit a specific vehicle.

---

# 6. Supplier Parts

## 6.1 GET /supplier-parts

Retrieve normalized supplier parts.

---

## 6.2 GET /supplier-parts/:id

Return a single supplier part including:
- raw data  
- normalized data  
- match mapping to canonical part  

---

# 7. Pricing API

## 7.1 GET /pricing/part/:id

Returns latest pricing computation:

```
{
  "success": true,
  "data": {
    "partId": "...",
    "price": 89.99,
    "cost": 43.00,
    "margin": 0.47,
    "metadata": {...}
  }
}
```

---

# 8. Orders

## 8.1 POST /orders

Creates an order.

### Body:
```
{
  "userId": "optional",
  "vehicleId": "uuid",
  "items": [
    { "partId": "uuid", "quantity": 1 }
  ],
  "shippingAddress": { ... }
}
```

---

## 8.2 GET /orders/:id

Detailed order summary including supplier selection.

---

## 8.3 POST /orders/:id/cancel

Cancels an order (if still pending).

---

## 8.4 GET /orders/:id/events

Returns historic workflow events.

---

# 9. Search Endpoints

## 9.1 GET /search/parts

### Query:
```
?query=brake+pads&vehicleId=optional
```

Search results include:
- part name  
- category  
- price  
- optional fitment status  

---

# 10. Support Agent API

## 10.1 POST /support/message

Sends a user message to Support Agent and returns reply.

### Body:
```
{
  "message": "Will this fit my 2015 Civic?",
  "vehicleId": "optional",
  "partId": "optional"
}
```

### Response:
```
{
  "success": true,
  "data": {
    "reply": "...",
    "confidence": 0.91
  }
}
```

---

# 11. Workflow & Queue API (Admin Only)

## 11.1 GET /admin/workflows

List active and historical workflows.

---

## 11.2 GET /admin/workflows/:id

Returns workflow context and task states.

---

## 11.3 POST /admin/workflows/:id/retry

Retries a failed workflow.

---

## 11.4 GET /admin/tasks

Lists:
- pending  
- running  
- dead  

---

## 11.5 POST /admin/tasks/:id/requeue

Requeues a dead task.

---

# 12. Vector Memory API

## 12.1 GET /memory/search

### Query:
```
?collection=agent_event_embeddings&query=text&k=10
```

Optional filters:
- agent  
- partId  
- vehicleId  

---

# 13. Health & Utility Endpoints

## 13.1 GET /health

Returns:

```
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

## 13.2 GET /version

Returns git commit hash + build timestamp.

---

# 14. Error Codes

Codex must implement these standard error codes:

| Code | Meaning |
|------|---------|
| `NOT_FOUND` | Resource not found |
| `INVALID_INPUT` | Validation failed |
| `FITMENT_ERROR` | Fitment logic error |
| `LLM_ERROR` | LLM Router failure |
| `WORKFLOW_ERROR` | Workflow processing failed |
| `UNAUTHORIZED` | Admin endpoint access only |
| `SERVER_ERROR` | Unexpected failure |

---

# 15. Rate Limiting (Phase 3+)

Support endpoints and global search should implement IP-based rate limits.

---

# End of API_REFERENCE.md
