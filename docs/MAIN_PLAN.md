# MAIN_PLAN.md

# AutoMechanica — Master System Plan  
**A Fully Autonomous, AI‑Driven Car Parts Dropshipping Platform**

> **Document Purpose**: This is the foundational blueprint for AutoMechanica. Every AI agent, developer, and system component should reference this document to understand the complete vision, architectural decisions, and implementation strategy. This plan is designed to enable autonomous development and extension of the platform.

---

## 1. Vision & Strategy

### 1.1 Core Vision

AutoMechanica is a **fully automated car‑parts dropshipping platform** powered by a network of coordinated AI agents. Think of it as a digital parts warehouse with a brain—a system that thinks, learns, and acts autonomously to serve customers with precision and intelligence.

**The Problem We Solve:**
- **Supplier Data Chaos**: Automotive suppliers provide data in inconsistent formats (CSV, XML, API) with varying quality, naming conventions, and completeness
- **Fitment Complexity**: Determining which parts fit which vehicles requires domain expertise and cross-referencing multiple data sources
- **Manual Operations**: Traditional dropshipping requires human intervention for cataloging, pricing, content creation, and customer support
- **Scale Limitations**: Human-operated systems can't efficiently manage catalogs with 100K+ SKUs across thousands of vehicle models

**Our Solution:**
AutoMechanica operates through an intelligent, self-managing pipeline:

1. **Intelligent Ingestion**: Consumes raw supplier feeds (CSV, API, EDI) regardless of format inconsistencies
2. **Semantic Normalization**: Uses LLM-powered agents to understand and normalize part data into canonical records
3. **Autonomous Fitment Mapping**: Determines vehicle compatibility using rules engines, pattern matching, and LLM reasoning with confidence scoring
4. **Dynamic Pricing**: Applies competitive intelligence and margin rules to price products optimally
5. **SEO Content Generation**: Creates search-optimized, brand-consistent product descriptions automatically
6. **Intelligent Publication**: Publishes products to the storefront with rich metadata and fitment data
7. **AI-Powered Support**: Handles customer inquiries with context-aware responses, including vehicle-specific fitment questions

**Strategic Differentiators:**
- **100% Automation**: Zero human intervention required for catalog operations at scale
- **Fitment Intelligence**: Industry-leading accuracy in vehicle compatibility determination
- **Multi-Model LLM Architecture**: Routes tasks to optimal AI models (cost vs. quality tradeoffs)
- **Self-Improving**: Vector memory and evaluation framework enable continuous learning
- **Modular & Extensible**: Task-queue architecture allows adding new capabilities without system rewrites

### 1.2 Business Model

**Revenue Streams:**
- **Primary**: Dropshipping margin (typically 15-35% markup on supplier wholesale)
- **Secondary**: Premium fitment guarantee services, extended support packages

**Target Market:**
- **Primary**: DIY automotive enthusiasts and independent mechanics
- **Secondary**: Fleet maintenance operations, automotive repair shops

**Competitive Advantages:**
- Vast catalog coverage (100K+ parts) managed autonomously
- Superior fitment accuracy reduces returns and increases customer confidence
- AI support provides 24/7 instant assistance
- Lower operational costs enable competitive pricing

### 1.3 Technical Philosophy

**Principles Guiding Architecture:**

1. **Agent-First Design**: Every major operation is performed by a specialized, autonomous agent
2. **Eventual Consistency**: Embrace asynchronous operations; perfection is achieved through iterations
3. **Observability by Default**: Every agent action is logged, traceable, and evaluable
4. **Fail Forward**: Systems should degrade gracefully and self-recover where possible
5. **Cost-Conscious AI**: Route expensive LLM operations intelligently; use local models for simple tasks
6. **Data as Truth**: Maintain single source of truth in canonical models; all views derive from this
7. **Separation of Concerns**: Clear boundaries between ingestion, processing, storage, and presentation
8. **Test Everything**: Automated evaluation harnesses validate agent performance continuously


---

## 2. High-Level Architecture Overview

### 2.1 System Topology

AutoMechanica is composed of **four major layers** that work together to create a cohesive, intelligent platform:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│  (React Frontend, Support Chat, Vehicle Selector, Product Pages)│
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│    (REST API, GraphQL, WebSocket handlers, Auth, Sessions)      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                           │
│  (Workflow Engine, Task Queue, Agent Coordination, LLM Router)  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      INTELLIGENCE LAYER                          │
│  (AI Agents, Vector Memory, Evaluation Framework, ML Models)    │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE LAYER                          │
│     (PostgreSQL + pgvector, Redis Cache, S3 Object Storage)     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Subsystems

AutoMechanica consists of **10 interconnected subsystems**:

#### 2.2.1 Backend Core (TypeScript/Node.js)

**Technology Stack:**
- **Runtime**: Node.js 20+ with TypeScript 5.3+
- **Framework**: Express.js or Fastify for HTTP API
- **ORM**: Drizzle ORM or Prisma for type-safe database access
- **Validation**: Zod for runtime type validation

**Components:**

1. **API Layer** (`src/api/`)
   - RESTful endpoints for CRUD operations
   - GraphQL API for complex queries (optional MVP enhancement)
   - WebSocket server for real-time support chat
   - Authentication & authorization middleware
   - Rate limiting and request validation
   - API versioning strategy (v1, v2, etc.)

2. **Database Layer** (`src/db/`)
   - Connection pooling and transaction management
   - Migration system (using node-pg-migrate or Drizzle migrations)
   - Repository pattern implementations
   - Query builders for complex operations
   - Database health checks and monitoring

3. **Models & Domain Logic** (`src/models/`, `src/domain/`)
   - Entity definitions (Vehicle, Part, Fitment, Order, etc.)
   - Business rule enforcement
   - Domain events and event emitters
   - Value objects and aggregates
   - Domain service interfaces

4. **Task Queue & Worker System** (`src/queue/`, `src/workers/`)
   - Task enqueueing with priority levels
   - Worker pool management
   - Task leasing and heartbeat mechanism
   - Dead letter queue for failed tasks
   - Task retry logic with exponential backoff
   - Worker health monitoring

5. **Orchestrator & Workflows** (`src/orchestrator/`, `src/workflows/`)
   - Workflow definition DSL
   - Step execution engine
   - State machine management
   - Saga pattern for distributed transactions
   - Workflow versioning
   - Parallel and sequential step execution

6. **Vector Memory Module** (`src/memory/`)
   - Embedding generation pipeline
   - Vector similarity search
   - Memory retrieval strategies (semantic search, temporal decay)
   - Memory consolidation and cleanup
   - Integration with pgvector and optional Qdrant

7. **LLM Router Module** (`src/llm/`)
   - Provider abstraction layer (OpenAI, Anthropic, Ollama)
   - Automatic model selection based on task type
   - Prompt template management
   - Response parsing and validation
   - Cost tracking and budget enforcement
   - Fallback strategies for provider failures
   - Structured output extraction

**Key Design Patterns:**
- **Repository Pattern**: Abstract data access from business logic
- **Factory Pattern**: Create agents and workflow instances
- **Strategy Pattern**: LLM routing and pricing strategies
- **Observer Pattern**: Event-driven agent communication
- **Command Pattern**: Task queue operations

#### 2.2.2 Frontend (React + TypeScript + Tailwind CSS)

**Technology Stack:**
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite or Next.js (for SSR benefits)
- **Styling**: Tailwind CSS 3+ with custom design tokens
- **State Management**: Zustand or Redux Toolkit
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6 or Next.js App Router

**Core Features:**

1. **Vehicle Selector & Garage** (`src/components/VehicleSelector/`)
   - Year → Make → Model → Trim → Engine cascade selectors
   - "My Garage" multi-vehicle storage (localStorage + optional account sync)
   - Quick vehicle switching
   - Recent vehicle history
   - Vehicle validation against database

2. **Category Navigation** (`src/pages/Categories/`)
   - Hierarchical category tree (e.g., Brakes → Brake Pads → Ceramic Pads)
   - Dynamic breadcrumb navigation
   - Filter sidebar (brand, price range, fitment confidence, ratings)
   - Sort options (relevance, price, popularity)
   - Lazy-loaded product grid with infinite scroll
   - "Fits Your Vehicle" badge on compatible parts

3. **Product Detail Pages** (`src/pages/ProductDetail/`)
   - High-resolution image gallery with zoom
   - Fitment verification section ("Fits your 2018 Honda Accord LX")
   - Specifications table (dimensions, weight, material, OEM numbers)
   - Reverse fitment table ("Compatible Vehicles")
   - SEO-optimized description
   - Reviews and ratings (future)
   - Related products carousel
   - Add to cart with quantity selector

4. **Fitment UX Enhancements**
   - Visual confidence indicators (✓ Verified Fit, ~ Likely Fit, ? Unknown)
   - "Why does this fit?" expandable explanations
   - Warning badges for parts requiring additional components
   - Installation complexity indicators
   - Compatibility notes (e.g., "Requires specific brake caliper type")

5. **Support Chat Widget** (`src/components/SupportChat/`)
   - Persistent chat bubble in bottom-right corner
   - Context-aware greeting based on page
   - Message history persistence
   - Typing indicators
   - File/image upload for support queries
   - Quick action buttons ("Does this fit my car?", "Track my order")
   - Agent handoff UI for escalation (future)

6. **Shopping Experience**
   - Cart with real-time inventory checks
   - Simplified checkout flow
   - Order confirmation and tracking pages
   - Email notifications

**Design System:**
- Defined in `BRAND_GUIDE.md` and `FRONTEND_UX_SPEC.md`
- Component library with Storybook documentation
- Accessibility compliance (WCAG 2.1 AA)
- Mobile-first responsive design
- Performance budgets (Lighthouse scores: 90+ on all metrics)

#### 2.2.3 AI Agents (The Intelligence Layer)

Each agent is a specialized, autonomous unit with:
- **Clear Purpose**: Single responsibility principle
- **Input/Output Contract**: Well-defined data schemas
- **Memory Access**: Can store and retrieve from vector memory
- **Evaluation Hooks**: Performance metrics and quality checks
- **Error Handling**: Graceful degradation and retry logic

**Agent Catalog:**

1. **SupplierNormalizationAgent** (`src/agents/SupplierNormalizationAgent.ts`)
   - **Purpose**: Transform raw supplier data into clean, structured format
   - **Input**: Supplier CSV row, XML node, or API response
   - **Output**: Normalized `SupplierPart` record
   - **Logic**:
     - Parse and validate input data
     - Map supplier-specific field names to canonical schema
     - Extract part numbers, brands, descriptions
     - Handle missing or malformed data
     - Flag data quality issues
   - **LLM Usage**: Minimal (local model for ambiguous field mapping)
   - **Success Criteria**: >95% field extraction accuracy

2. **ProductDataAgent** (`src/agents/ProductDataAgent.ts`)
   - **Purpose**: Map normalized supplier parts to canonical parts
   - **Input**: Normalized `SupplierPart`
   - **Output**: Matched or newly created `CanonicalPart`
   - **Logic**:
     - Search existing canonical parts using:
       - Part number exact match
       - Brand + part number match
       - Vector similarity search on descriptions
     - If match found with confidence >0.85: link supplier part
     - If no match: create new canonical part
     - Merge data from multiple suppliers for same canonical part
   - **LLM Usage**: Moderate (GPT-4 for ambiguous matches, embeddings for search)
   - **Success Criteria**: <5% duplicate canonical parts, >90% match accuracy

3. **FitmentAgent** (`src/agents/FitmentAgent.ts`)
   - **Purpose**: Determine which vehicles a part fits
   - **Input**: `CanonicalPart` with all available metadata
   - **Output**: Array of `Fitment` records with confidence scores
   - **Logic** (Multi-Strategy Approach):
     - **Strategy 1: Rule-Based Matching**
       - Universal parts (e.g., "Fits all vehicles with 5x114.3 bolt pattern")
       - Direct OEM number lookup against vehicle database
       - Category-specific rules (e.g., wiper blade length tables)
     - **Strategy 2: Pattern Recognition**
       - Extract year ranges, make/model mentions from descriptions
       - Parse fitment notes (e.g., "2015-2020 Honda Civic")
     - **Strategy 3: LLM Reasoning**
       - For ambiguous cases, provide part + vehicle context to Claude/GPT-4
       - Request structured fitment determination with evidence
     - **Strategy 4: Vector Similarity**
       - Compare part embedding to known fitment embeddings
   - **Confidence Scoring**:
     - 0.95-1.0: Direct OEM match or explicit supplier data
     - 0.80-0.94: Rule-based match with strong evidence
     - 0.60-0.79: LLM reasoning with supporting context
     - 0.40-0.59: Vector similarity match (low confidence)
     - Below 0.40: Do not publish fitment
   - **LLM Usage**: High (Claude Opus for complex reasoning)
   - **Success Criteria**: >92% accuracy on gold dataset, <3% false positives

4. **PricingAgent** (`src/agents/PricingAgent.ts`)
   - **Purpose**: Set competitive, profitable prices for canonical parts
   - **Input**: `CanonicalPart`, supplier cost, market data
   - **Output**: Recommended retail price
   - **Logic**:
     - **Base Pricing**: Apply category-specific margin rules
       - High-margin categories: Accessories (35-45%)
       - Medium-margin: Replacement parts (25-35%)
       - Low-margin: Commodities (15-25%)
     - **Competitive Intelligence**: 
       - Query competitor prices from cache/API
       - Position pricing (e.g., 5% below market average)
     - **Cost-Plus Floor**: Never price below (cost * 1.15) + shipping estimate
     - **Psychological Pricing**: Round to .99 or .95 endings
     - **Dynamic Adjustments**:
       - Increase slow-moving inventory prices gradually
       - Decrease prices for overstocked items
   - **LLM Usage**: None (rule-based, may use LLM for market research in future)
   - **Success Criteria**: Maintain 28%+ average gross margin, <2% pricing errors

5. **SEOAgent** (`src/agents/SEOAgent.ts`)
   - **Purpose**: Generate search-optimized, brand-consistent product content
   - **Input**: `CanonicalPart` with specs, fitments, and brand guidelines
   - **Output**: SEO title, meta description, product description (HTML)
   - **Logic**:
     - **Title Generation** (55-60 chars):
       - Format: `[Brand] [Part Type] for [Common Vehicles] | AutoMechanica`
       - Example: `Bosch Brake Pads for Honda Civic 2016-2021 | AutoMechanica`
     - **Meta Description** (150-160 chars):
       - Include key specs, fitment summary, and CTA
     - **Product Description** (300-500 words):
       - Opening: Part purpose and key benefits
       - Specifications section (bullet points)
       - Fitment summary (compatible vehicles)
       - Installation notes (if applicable)
       - Brand information and warranty details
       - Closing: CTA and confidence statement
     - **Tone & Voice**: Follow `BRAND_GUIDE.md` and `VOICE_TONE_GUIDE.md`
       - Professional yet approachable
       - Technical accuracy without jargon overload
       - Customer-benefit focused
   - **LLM Usage**: High (GPT-4 Turbo or Claude for content generation)
   - **Success Criteria**: Readability score >60, keyword density optimal, no factual errors

6. **SupportAgent** (`src/agents/SupportAgent.ts`)
   - **Purpose**: Handle customer inquiries with contextual, helpful responses
   - **Input**: Customer message, conversation history, user context (vehicle, cart, orders)
   - **Output**: Support response (text, with optional suggested actions)
   - **Capabilities**:
     - **Fitment Questions**: "Will these brake pads fit my 2019 Toyota Camry?"
       - Query fitment database
       - Provide confidence level and reasoning
       - Offer alternative parts if no match
     - **Product Comparisons**: "What's the difference between these two oil filters?"
       - Fetch product specs
       - Generate comparison table
       - Recommend based on user's vehicle/needs
     - **Order Support**: "Where is my order?" / "I need to change my address"
       - Retrieve order status
       - Provide tracking information
       - Escalate modification requests to human (MVP: provide contact info)
     - **General Automotive Advice**: "How often should I change brake pads?"
       - Draw from knowledge base
       - Provide general guidance with disclaimers
       - Recommend relevant products
   - **Safety Rules** (defined in `SUPPORT_POLICY.md`):
     - Never provide mechanical advice that could cause safety issues
     - Always recommend professional installation for critical components
     - Disclose AI nature of support
     - Escalate to human for: refunds, complaints, complex technical issues
   - **LLM Usage**: Very High (GPT-4o for conversational quality, real-time response)
   - **Success Criteria**: <30s response time, >85% customer satisfaction, zero safety incidents

**Agent Communication:**
- Agents communicate through:
  - Task Queue (async job passing)
  - Shared database (reading common entities)
  - Vector Memory (semantic context sharing)
  - Event Bus (real-time notifications for urgent coordination)

#### 2.2.4 Data Persistence Layer

**Primary Database: PostgreSQL 15+**

**Rationale for PostgreSQL:**
- **JSONB Support**: Flexible schema for supplier data variability
- **pgvector Extension**: Native vector storage and similarity search
- **ACID Compliance**: Critical for order and inventory management
- **Rich Querying**: Complex joins for fitment queries
- **Mature Ecosystem**: Excellent tooling and community support

**Database Schema Design Principles:**
- **Normalization**: 3rd normal form for core entities
- **Denormalization**: Strategic denormalization for read-heavy queries (product listings)
- **Partitioning**: Table partitioning for large tables (agent_events, order_lines)
- **Indexing Strategy**:
  - B-tree indexes on foreign keys and frequently filtered columns
  - GiST/GIN indexes for JSONB and full-text search
  - IVFFlat indexes for vector similarity (pgvector)

**Caching Layer: Redis 7+**

**Use Cases:**
- Session storage
- Rate limiting counters
- Hot product data cache (TTL: 5 minutes)
- Real-time inventory counts
- LLM response cache (deduplicate identical queries)
- Workflow state snapshots

**Object Storage: AWS S3 or Compatible (MinIO for local dev)**

**Stored Objects:**
- Product images (original + thumbnails)
- Supplier data file uploads
- Generated reports and exports
- Backup snapshots
- Agent evaluation datasets  


---

## 3. Core Data Model

> **Reference**: See `DOMAIN_MODEL.md` for complete schema definitions, field types, and relationships.

The canonical domain of AutoMechanica is built on **six foundational entity groups**:

### 3.1 Vehicle Model (`vehicles` table)

**Purpose**: Represents specific vehicle configurations that parts can fit.

**Schema:**
```typescript
interface Vehicle {
  id: string;                    // UUID primary key
  year: number;                  // Model year (e.g., 2018)
  make: string;                  // Manufacturer (e.g., "Honda")
  model: string;                 // Model name (e.g., "Civic")
  trim: string | null;           // Trim level (e.g., "LX", "Sport")
  engine: string | null;         // Engine code (e.g., "2.0L L4 DOHC 16V")
  bodyStyle: string | null;      // Body type (e.g., "Sedan", "Coupe")
  driveType: string | null;      // Drive configuration (e.g., "FWD", "AWD")
  transmission: string | null;   // Transmission type (e.g., "CVT", "6-speed manual")
  metadata: object;              // JSONB: Additional specs (wheelbase, weight, etc.)
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Key Indexes:**
- Composite index on `(year, make, model, trim)` for fast lookups
- Full-text search index on `(make, model, trim)` for autocomplete

**Data Sources:**
- Seeded from NHTSA vehicle database
- Enriched from ACES/PIES standards
- Manual additions for specialty vehicles

**Unique Constraints:**
- Combination of `(year, make, model, trim, engine)` must be unique

**Business Rules:**
- `year` must be between 1950 and current_year + 2
- `make` and `model` are required; trim and engine are optional but highly recommended
- Normalization: Store make/model values in Title Case

### 3.2 Canonical Part (`canonical_parts` table)

**Purpose**: Clean, normalized, universal representation of a part—the single source of truth.

**Schema:**
```typescript
interface CanonicalPart {
  id: string;                           // UUID primary key
  partNumber: string;                   // Primary part number (usually OEM or most common)
  brand: string;                        // Primary brand/manufacturer
  category: string;                     // Category path (e.g., "Brakes/Brake Pads/Ceramic")
  name: string;                         // Display name (e.g., "Premium Ceramic Brake Pads")
  description: string | null;           // Rich HTML description (SEO content)
  specifications: object;               // JSONB: Structured specs (dimensions, material, etc.)
  images: string[];                     // Array of image URLs
  price: number | null;                 // Current retail price (cents)
  cost: number | null;                  // Lowest supplier cost (cents)
  status: 'draft' | 'active' | 'inactive' | 'discontinued';
  seoTitle: string | null;              // SEO-optimized title
  seoMetaDescription: string | null;    // SEO meta description
  slug: string;                         // URL-friendly slug (e.g., "premium-ceramic-brake-pads-bp1234")
  searchVector: tsvector;               // Full-text search vector
  embedding: vector(1536) | null;       // Semantic search embedding (OpenAI ada-002)
  qualityScore: number;                 // Data quality score (0-100)
  createdAt: timestamp;
  updatedAt: timestamp;
  publishedAt: timestamp | null;        // When made live on storefront
}
```

**Key Indexes:**
- Unique index on `slug`
- GiST index on `searchVector` for full-text search
- IVFFlat index on `embedding` for vector similarity (pgvector)
- B-tree index on `(category, status)`
- B-tree index on `brand`

**Derived Fields:**
- `searchVector`: Auto-generated from `name`, `description`, `brand`, `category`
- `embedding`: Generated by LLM Router using OpenAI ada-002
- `slug`: Auto-generated from `brand` + `name` + `partNumber` (unique, lowercase, hyphenated)
- `qualityScore`: Calculated based on completeness (specs filled, images count, fitment count)

**Status Lifecycle:**
- `draft`: Created but not ready for publication (incomplete data)
- `active`: Published and visible on storefront
- `inactive`: Temporarily hidden (e.g., out of stock)
- `discontinued`: No longer available (preserved for historical orders)

**Business Rules:**
- Cannot publish (`active`) unless `qualityScore >= 70`
- Must have at least 1 image to publish
- Must have at least 1 fitment record to publish
- Price must be > cost * 1.15 (minimum 15% margin)

### 3.3 Supplier Parts (`supplier_parts` table)

**Purpose**: Raw or normalized supplier data linked to canonical parts.

**Schema:**
```typescript
interface SupplierPart {
  id: string;                           // UUID primary key
  supplierId: string;                   // Foreign key to suppliers table
  canonicalPartId: string | null;       // Foreign key to canonical_parts (null until mapped)
  supplierPartNumber: string;           // Supplier's part number
  supplierBrand: string | null;         // Supplier's brand field
  rawData: object;                      // JSONB: Complete raw supplier data row
  normalizedData: object | null;        // JSONB: Cleaned/normalized fields
  cost: number;                         // Wholesale cost (cents)
  availability: 'in_stock' | 'out_of_stock' | 'discontinued' | 'unknown';
  leadTimeDays: number | null;          // Estimated ship time
  minimumOrderQuantity: number;         // Minimum qty for order (default 1)
  mappingConfidence: number | null;     // Confidence of mapping to canonical part (0-1)
  mappingMethod: 'exact' | 'fuzzy' | 'vector' | 'llm' | 'manual' | null;
  lastSyncedAt: timestamp | null;       // When data was last refreshed from supplier
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Key Indexes:**
- Composite index on `(supplierId, supplierPartNumber)` (unique)
- B-tree index on `canonicalPartId` (for reverse lookup)
- B-tree index on `availability`
- GIN index on `rawData` for JSONB queries

**Mapping Strategies:**
- **Exact Match**: `supplierPartNumber` matches known `partNumber` in canonical parts
- **Fuzzy Match**: Levenshtein distance or trigram similarity on part numbers
- **Vector Search**: Embedding similarity between supplier description and canonical embeddings
- **LLM Mapping**: ProductDataAgent makes determination using AI reasoning
- **Manual**: Human review and mapping (rare)

**Business Rules:**
- Multiple supplier parts can map to one canonical part (consolidation)
- Canonical part's `cost` is min(all linked supplier_parts.cost)
- If supplier part becomes `discontinued`, alert if it's the only source for canonical part

### 3.4 Fitments (`fitments` table)

**Purpose**: Links canonical parts to vehicles with confidence and evidence.

**Schema:**
```typescript
interface Fitment {
  id: string;                           // UUID primary key
  canonicalPartId: string;              // Foreign key to canonical_parts
  vehicleId: string;                    // Foreign key to vehicles
  confidence: number;                   // Confidence score (0.0 - 1.0)
  fitmentType: 'universal' | 'direct_fit' | 'modification_required' | 'unknown';
  evidence: object;                     // JSONB: Reasoning, sources, OEM numbers, etc.
  source: 'supplier_data' | 'oem_database' | 'rules_engine' | 'llm_reasoning' | 'manual';
  verifiedAt: timestamp | null;         // If manually verified by expert
  notes: string | null;                 // Installation notes, warnings, additional info
  positionSpecific: string | null;      // Position (e.g., "Front Left", "Rear")
  requiresAdditionalParts: boolean;     // If true, flag that other parts are needed
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Key Indexes:**
- Composite index on `(canonicalPartId, vehicleId)` (unique)
- B-tree index on `vehicleId` (for vehicle-specific queries)
- B-tree index on `confidence` (for quality filtering)
- GIN index on `evidence` for JSONB queries

**Confidence Tier Interpretation:**
- **0.95 - 1.00**: Verified fit (OEM match, supplier guarantee, manual verification)
- **0.80 - 0.94**: High confidence (rules-based, strong evidence)
- **0.60 - 0.79**: Moderate confidence (LLM reasoning, circumstantial evidence)
- **Below 0.60**: Low confidence (do not display to customers)

**Display Rules:**
- Show "✓ Verified Fit" badge for confidence >= 0.95
- Show "Likely Fit" for confidence 0.80-0.94
- Hide fitments with confidence < 0.60 from search results
- Allow users to filter by confidence threshold

**Evidence Structure Example:**
```json
{
  "oemNumbers": ["43022-T2F-A01", "43022T2FA01"],
  "reasoning": "Direct OEM part number match in Honda parts database",
  "sources": ["supplier_catalog_2024", "honda_oem_database"],
  "conflictingInfo": null,
  "reviewedBy": "FitmentAgent_v1.2.0"
}
```

### 3.5 Orders & Order Lines (`orders`, `order_lines` tables)

**Purpose**: Minimal commerce backend to support checkout and fulfillment tracking.

**Orders Schema:**
```typescript
interface Order {
  id: string;                           // UUID primary key
  orderNumber: string;                  // Human-readable order number (e.g., "AM-2024-001234")
  customerId: string | null;            // Foreign key to customers table (null for guest)
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;                     // Sum of line items (cents)
  shippingCost: number;                 // Shipping fee (cents)
  tax: number;                          // Sales tax (cents)
  total: number;                        // Grand total (cents)
  shippingAddress: object;              // JSONB: Address fields
  billingAddress: object;               // JSONB: Address fields
  paymentMethod: string;                // Payment method type (e.g., "credit_card", "paypal")
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  trackingNumber: string | null;        // Shipping tracking number
  carrier: string | null;               // Shipping carrier (e.g., "FedEx", "UPS")
  notes: string | null;                 // Customer notes or internal notes
  createdAt: timestamp;
  updatedAt: timestamp;
  shippedAt: timestamp | null;
  deliveredAt: timestamp | null;
}
```

**Order Lines Schema:**
```typescript
interface OrderLine {
  id: string;                           // UUID primary key
  orderId: string;                      // Foreign key to orders
  canonicalPartId: string;              // Foreign key to canonical_parts
  supplierPartId: string;               // Foreign key to supplier_parts (selected source)
  quantity: number;                     // Quantity ordered
  unitPrice: number;                    // Price per unit at time of order (cents)
  lineTotal: number;                    // quantity * unitPrice (cents)
  vehicleId: string | null;             // If ordered for specific vehicle (optional)
  fulfillmentStatus: 'pending' | 'ordered_from_supplier' | 'shipped_by_supplier' | 'received' | 'shipped_to_customer' | 'delivered' | 'cancelled';
  supplierOrderId: string | null;       // Supplier's order reference
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Key Indexes:**
- B-tree index on `orderNumber` (unique)
- B-tree index on `customerId`
- B-tree index on `status`
- B-tree index on `(orderId)` for order_lines
- B-tree index on `fulfillmentStatus` for order_lines

**Business Rules:**
- `orderNumber` format: `AM-{YEAR}-{6-digit-sequence}`
- `total` must equal `subtotal + shippingCost + tax`
- Order status transitions follow state machine (cannot skip states)
- Order lines capture snapshot prices (immune to future price changes)
- Refunds create negative adjustment records (preserve audit trail)

### 3.6 Workflows & Agent Events (`workflows`, `workflow_steps`, `agent_events` tables)

**Purpose**: For orchestration, observability, memory, and evaluation.

**Workflows Schema:**
```typescript
interface Workflow {
  id: string;                           // UUID primary key
  workflowType: string;                 // Workflow template name (e.g., "wf_ingest_supplier_catalog")
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: object;                        // JSONB: Input parameters
  output: object | null;                // JSONB: Final output data
  error: object | null;                 // JSONB: Error details if failed
  startedAt: timestamp | null;
  completedAt: timestamp | null;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Workflow Steps Schema:**
```typescript
interface WorkflowStep {
  id: string;                           // UUID primary key
  workflowId: string;                   // Foreign key to workflows
  stepName: string;                     // Step identifier (e.g., "normalize_supplier_data")
  agentName: string | null;             // Which agent executed this step
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input: object;                        // JSONB: Step input
  output: object | null;                // JSONB: Step output
  error: object | null;                 // JSONB: Error details
  startedAt: timestamp | null;
  completedAt: timestamp | null;
  durationMs: number | null;            // Execution time
  retryCount: number;                   // Number of retry attempts
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Agent Events Schema:**
```typescript
interface AgentEvent {
  id: string;                           // UUID primary key
  workflowId: string | null;            // Foreign key to workflows (if part of workflow)
  workflowStepId: string | null;        // Foreign key to workflow_steps
  agentName: string;                    // Agent identifier (e.g., "FitmentAgent")
  eventType: 'task_started' | 'task_completed' | 'task_failed' | 'decision_made' | 'llm_call' | 'memory_stored' | 'evaluation_run';
  eventData: object;                    // JSONB: Event-specific data
  llmProvider: string | null;           // LLM provider used (e.g., "openai", "anthropic")
  llmModel: string | null;              // Model name (e.g., "gpt-4-turbo")
  llmTokensUsed: number | null;         // Total tokens consumed
  llmCostUsd: number | null;            // Estimated cost
  embedding: vector(1536) | null;       // Event embedding for memory search
  timestamp: timestamp;
}
```

**Key Indexes:**
- B-tree index on `workflowType` for workflows
- B-tree index on `status` for workflows and workflow_steps
- Composite index on `(workflowId, stepName)` for workflow_steps
- B-tree index on `agentName` for agent_events
- B-tree index on `eventType` for agent_events
- Time-series partitioning on `agent_events` by month (for performance)
- IVFFlat index on `embedding` for semantic event search

**Observability Use Cases:**
- Real-time monitoring dashboards showing active workflows
- Agent performance metrics (avg duration, success rate by agent)
- Cost tracking (LLM token usage and USD spend by agent/workflow)
- Debugging failed workflows (inspect step inputs/outputs)
- Memory retrieval (semantic search over past agent decisions)
- Evaluation dataset creation (export successful event chains)

**Retention Policies:**
- Keep workflow records indefinitely (small volume)
- Keep workflow_steps for 1 year (medium volume)
- Keep agent_events for 90 days (high volume, partition and archive)

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

### 5.1 LLM Router (`src/llm/LLMRouter.ts`)

**Purpose**: Intelligently route AI tasks to optimal models, balancing cost vs. quality.

**Provider Configuration:**

```typescript
const providerMatrix = {
  'openai': {
    models: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
    embeddings: 'text-embedding-ada-002',
    strengths: ['structured_output', 'function_calling', 'speed'],
    costPerMToken: { 'gpt-4-turbo': 10.00, 'gpt-4o': 5.00, 'gpt-3.5-turbo': 0.50 }
  },
  'anthropic': {
    models: ['claude-opus-4', 'claude-sonnet-4.5', 'claude-haiku-4'],
    embeddings: null,
    strengths: ['long_context', 'reasoning', 'safety'],
    costPerMToken: { 'claude-opus-4': 15.00, 'claude-sonnet-4.5': 3.00, 'claude-haiku-4': 0.25 }
  },
  'local': {
    models: ['llama3.1:8b', 'mistral:7b'],
    embeddings: 'nomic-embed-text',
    strengths: ['cost', 'privacy', 'batch_processing'],
    costPerMToken: { '*': 0.00 }
  }
};
```

**Routing Strategy by Task Type:**

| Task Type | Primary Provider | Model | Rationale |
|-----------|------------------|-------|----------|
| `supplier_normalization` | Local | llama3.1:8b | Simple field mapping, high volume |
| `canonical_matching` | OpenAI | gpt-4o | Needs embeddings + reasoning |
| `fitment_determination` | Anthropic | claude-sonnet-4.5 | Complex reasoning, safety-critical |
| `pricing_calculation` | N/A (rule-based) | N/A | No LLM needed |
| `seo_content_generation` | OpenAI | gpt-4-turbo | Structured output, creative writing |
| `customer_support` | OpenAI | gpt-4o | Real-time, conversational quality |
| `embedding_generation` | OpenAI | ada-002 | Industry standard, fast |

**Fallback Strategy:**
1. Try primary provider/model
2. On rate limit: Wait with exponential backoff (max 3 retries)
3. On provider outage: Fall back to secondary provider (OpenAI ↔ Anthropic)
4. On budget exhaustion: Fall back to local model or queue task for later
5. On complete failure: Log error, mark task as failed, alert monitoring

**Cost Management:**
- Track token usage per task type, agent, workflow
- Set daily/monthly budget limits
- Alert when 80% of budget consumed
- Automatically switch to cheaper models when approaching limits
- Cache identical requests (5-minute TTL) to deduplicate LLM calls

**Implementation Details:**
```typescript
interface LLMRouterConfig {
  taskType: TaskType;
  context: string;
  maxTokens?: number;
  temperature?: number;
  structuredOutput?: ZodSchema;
  cacheable?: boolean;
}

class LLMRouter {
  async route(config: LLMRouterConfig): Promise<LLMResponse> {
    const provider = this.selectProvider(config.taskType);
    const cacheKey = this.getCacheKey(config);
    
    if (config.cacheable) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const response = await this.callProvider(provider, config);
      await this.logUsage(provider, response.tokensUsed, response.cost);
      
      if (config.cacheable) {
        await this.cache.set(cacheKey, response, 300); // 5 min TTL
      }
      
      return response;
    } catch (error) {
      return this.handleFailure(config, error);
    }
  }
}
```

**Monitoring Dashboard:**
- Real-time token usage by provider/model
- Cost tracking (daily, weekly, monthly)
- Average response time by task type
- Cache hit rate
- Failure rate by provider
- Top 10 most expensive queries

### 5.2 Vector Memory System (`src/memory/VectorMemory.ts`)

**Purpose**: Enable semantic search and agent learning through embeddings.

**Storage Architecture:**

```sql
-- Primary storage: pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memory_embeddings (
  id UUID PRIMARY KEY,
  memory_type VARCHAR(50) NOT NULL, -- 'agent_decision', 'fitment_reasoning', 'part_description', etc.
  entity_id UUID, -- Reference to related entity (canonical_part_id, workflow_id, etc.)
  content TEXT NOT NULL, -- Human-readable content that was embedded
  embedding vector(1536) NOT NULL, -- OpenAI ada-002 embeddings
  metadata JSONB, -- Flexible metadata (agent_name, confidence, tags, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);

-- IVFFlat index for fast similarity search
CREATE INDEX ON memory_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Memory Types:**

1. **Agent Decision Memory**
   - Stores: Agent reasoning, decisions made, context, outcomes
   - Use Case: "How did we determine fitment for similar parts in the past?"
   - Example: FitmentAgent's successful fitment determinations with evidence

2. **Part Matching Memory**
   - Stores: Supplier part → Canonical part mappings
   - Use Case: "Find canonical parts similar to this supplier description"
   - Example: Semantic search to match "Front Brake Pads - Ceramic" across suppliers

3. **Fitment Reasoning Memory**
   - Stores: Fitment explanations and evidence
   - Use Case: "Show similar fitment reasoning for related parts"
   - Example: "This brake rotor fits because it matches OEM spec X"

4. **Customer Interaction Memory**
   - Stores: Support chat conversations and resolutions
   - Use Case: "How did we handle similar customer questions?"
   - Example: Previous fitment inquiries for same vehicle

**Retrieval Strategies:**

```typescript
class VectorMemory {
  // Semantic similarity search
  async search(query: string, options: {
    memoryType?: string;
    limit?: number;
    similarityThreshold?: number;
    filters?: Record<string, any>;
  }): Promise<Memory[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    return db.query(`
      SELECT id, content, metadata, 
             1 - (embedding <=> $1) AS similarity
      FROM memory_embeddings
      WHERE memory_type = $2
        AND 1 - (embedding <=> $1) > $3
      ORDER BY embedding <=> $1
      LIMIT $4
    `, [queryEmbedding, options.memoryType, options.similarityThreshold || 0.7, options.limit || 10]);
  }
  
  // Store new memory
  async store(memory: {
    type: string;
    content: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const embedding = await this.generateEmbedding(memory.content);
    
    await db.insert('memory_embeddings', {
      memory_type: memory.type,
      entity_id: memory.entityId,
      content: memory.content,
      embedding: embedding,
      metadata: memory.metadata
    });
  }
  
  // Consolidation: Merge similar memories to reduce storage
  async consolidate(memoryType: string): Promise<void> {
    // Find clusters of highly similar memories (similarity > 0.95)
    // Merge into representative examples
    // Keep metadata about frequency
  }
}
```

**Memory Lifecycle:**
- **Creation**: Automatically stored after successful agent actions
- **Retrieval**: Injected into agent context for similar tasks
- **Consolidation**: Weekly job merges duplicate/similar memories
- **Archival**: Memories older than 1 year moved to cold storage (S3)
- **Deletion**: Low-value memories (never retrieved, low confidence) purged after 6 months

**Qdrant Integration (Post-MVP):**
- Migrate to Qdrant when memory_embeddings table exceeds 10M records
- Qdrant provides better performance at scale and advanced filtering
- Keep pgvector for initial MVP simplicity

### 5.3 Evaluation Framework (`src/evaluation/`)

**Purpose**: Continuously validate agent performance and system quality.

**Evaluation Types:**

#### 5.3.1 Fitment Accuracy Evaluation

**Goal**: Measure FitmentAgent's accuracy against gold standard dataset.

**Gold Dataset**: Manually verified fitments (1,000+ part-vehicle pairs)
```json
{
  "part_id": "uuid",
  "vehicle_id": "uuid",
  "ground_truth": "fits" | "does_not_fit" | "unknown",
  "verified_by": "expert_name",
  "verified_at": "timestamp"
}
```

**Evaluation Process:**
1. Run FitmentAgent on gold dataset parts
2. Compare predictions to ground truth
3. Calculate metrics:
   - **Accuracy**: (TP + TN) / Total
   - **Precision**: TP / (TP + FP) (minimize false positives)
   - **Recall**: TP / (TP + FN) (don't miss true fits)
   - **F1 Score**: Harmonic mean of precision and recall
   - **Confidence Calibration**: Do 95% confidence predictions actually fit 95% of the time?

**Success Criteria**: Accuracy >= 92%, Precision >= 94% (low false positives critical)

**Automated Testing**: Run nightly, alert if metrics drop below thresholds

#### 5.3.2 Pricing Sanity Checks

**Goal**: Validate PricingAgent doesn't create unprofitable or unrealistic prices.

**Checks:**
- ✓ Price > Cost * 1.15 (minimum 15% margin)
- ✓ Price < Cost * 10 (no 1000% markups)
- ✓ Price ends in .99 or .95 (psychological pricing)
- ✓ Price competitive with market average (within 20%)
- ✓ No sudden price changes >50% without reason

**Automated Testing**: Run after each pricing workflow, block publication if fails

#### 5.3.3 SEO Content Quality Evaluation

**Goal**: Ensure SEOAgent generates high-quality, on-brand content.

**Quality Metrics:**
- **Readability**: Flesch Reading Ease score >= 60
- **SEO Score**: Keyword presence, title length (55-60 chars), meta description (150-160 chars)
- **Brand Compliance**: Tone matches `VOICE_TONE_GUIDE.md` (automated sentiment + keyword analysis)
- **Factual Accuracy**: No hallucinated specifications (validate against canonical part data)
- **Uniqueness**: Not duplicated across products (>80% similarity = fail)

**Human Sampling**: Weekly review of 50 random descriptions by content team

**Automated Testing**: Run for each generated description, flag low-quality for human review

#### 5.3.4 Support Agent Safety Evaluation

**Goal**: Ensure SupportAgent never provides unsafe advice or violates policies.

**Safety Checks:**
- **Unsafe Advice Detection**: Scan for mechanical instructions on safety-critical components
- **PII Leakage**: Detect if agent asks for credit cards, SSNs, passwords
- **Refund Authorization**: Ensure agent never approves refunds (escalates instead)
- **Hallucination Detection**: Validate order numbers, tracking numbers exist in DB
- **Sentiment Analysis**: Flag negative sentiment conversations for review

**Red Team Testing**: Monthly adversarial prompting to find edge cases

**Automated Testing**: Real-time checks on every response before sending to user

**Evaluation Dashboard** (Admin Interface):
- Overall system health score (aggregate of all evaluations)
- Per-agent performance trends (charts over time)
- Recent failures with explanations
- Gold dataset management (add/edit verified examples)
- Manual review queue for flagged items

---

## 6. Workflow Orchestration

> **Reference**: See `AGENTS_AND_WORKFLOWS.md` and `TASK_QUEUE_SPEC.md` for complete specifications.

### 6.1 Orchestrator (`src/orchestrator/Orchestrator.ts`)

**Purpose**: Central controller managing workflow execution, step coordination, and error recovery.

**Core Responsibilities:**

1. **Workflow Lifecycle Management**
   - Create workflow instances from templates
   - Track workflow state (pending → running → completed/failed/cancelled)
   - Persist state to database for crash recovery
   - Provide workflow status API for monitoring

2. **Step Execution Coordination**
   - Execute workflow steps in defined order (sequential or parallel)
   - Inject step dependencies (output of step N becomes input of step N+1)
   - Handle conditional branching ("if fitment_confidence < 0.6, skip pricing")
   - Support manual approval steps (future: human-in-the-loop)

3. **Error Handling & Recovery**
   - Catch step failures and classify (transient vs. permanent)
   - Implement retry logic with exponential backoff
   - Support saga pattern for rollback (undo previous steps)
   - Move to dead-letter queue after max retries (default: 3)
   - Alert on critical failures via monitoring

4. **Observability**
   - Log all workflow events to `workflows` and `workflow_steps` tables
   - Log detailed agent actions to `agent_events` table
   - Emit real-time events to monitoring dashboard
   - Track metrics: duration, success rate, bottlenecks, costs

**Workflow Definition Schema:**

```typescript
interface WorkflowDefinition {
  name: string;                          // e.g., "wf_ingest_supplier_catalog"
  version: string;                       // Semantic version ("1.2.0")
  description: string;
  steps: WorkflowStep[];                 // Ordered array of steps
  onFailure?: 'rollback' | 'continue' | 'halt';
  timeout?: number;                      // Max workflow duration (ms)
}

interface WorkflowStep {
  name: string;                          // e.g., "normalize_supplier_data"
  agentClass?: string;                   // Agent to invoke (e.g., "SupplierNormalizationAgent")
  function?: string;                     // Or function name for non-agent steps
  input: Record<string, any> | ((context) => any); // Input data or transformer
  parallel?: boolean;                    // Can run in parallel with next step?
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
  condition?: (context) => boolean;      // Skip step if condition false
  timeout?: number;                      // Max step duration (ms)
}
```

**Example Workflow Execution:**

```typescript
const catalogIngestionWorkflow: WorkflowDefinition = {
  name: 'wf_ingest_supplier_catalog',
  version: '1.0.0',
  description: 'Ingest supplier catalog and publish parts',
  steps: [
    {
      name: 'extract_supplier_data',
      function: 'extractSupplierData',
      input: { supplierId: '{{input.supplierId}}', filePath: '{{input.filePath}}' },
      retryPolicy: { maxRetries: 2, backoffMs: 5000, backoffMultiplier: 2 }
    },
    {
      name: 'normalize_supplier_parts',
      agentClass: 'SupplierNormalizationAgent',
      input: (ctx) => ({ rawRecords: ctx.steps['extract_supplier_data'].output }),
      parallel: true // Can start next step while this completes
    },
    // ... more steps
  ],
  onFailure: 'halt',
  timeout: 7200000 // 2 hours
};

// Execution
const orchestrator = new Orchestrator();
const workflowId = await orchestrator.start(catalogIngestionWorkflow, {
  supplierId: 'acme-auto',
  filePath: 's3://imports/acme_feed_20241127.csv'
});

// Monitor progress
const status = await orchestrator.getStatus(workflowId);
// { status: 'running', currentStep: 'normalize_supplier_parts', progress: '2/7', startedAt: '...' }
```

**State Persistence:**
- Checkpoint workflow state after each step completion
- On system crash/restart, resume from last checkpoint
- Store intermediate outputs in workflow_steps.output (JSONB)

### 6.2 Workflow Catalog

#### 6.2.1 `wf_ingest_supplier_catalog`

**Purpose**: End-to-end supplier data ingestion to published parts.

**Trigger**: Manual upload, scheduled sync, or supplier webhook

**Steps**: (See Section 4.1 for detailed breakdown)
1. `extract_supplier_data` → Parse file
2. `normalize_supplier_parts` → SupplierNormalizationAgent
3. `map_canonical_parts` → ProductDataAgent
4. `determine_fitments` → FitmentAgent
5. `calculate_pricing` → PricingAgent
6. `generate_seo_content` → SEOAgent
7. `publish_parts` → Quality check + set status to 'active'

**Expected Duration**: 30 minutes - 3 hours (depending on catalog size)

**Success Metrics**: % of parts published, avg confidence score, cost

#### 6.2.2 `wf_publish_new_part` (Single Part)

**Purpose**: Quickly publish a single part (e.g., manual entry via admin).

**Steps**:
1. `validate_part_data` → Check required fields
2. `determine_fitments` → FitmentAgent
3. `calculate_pricing` → PricingAgent
4. `generate_seo_content` → SEOAgent
5. `publish_part` → Set status to 'active'

**Expected Duration**: 2-10 minutes

#### 6.2.3 `wf_process_order` (Future)

**Purpose**: Handle order fulfillment from placement to delivery.

**Steps**:
1. `validate_order` → Check inventory, payment
2. `place_supplier_orders` → Order from supplier(s)
3. `monitor_supplier_shipments` → Track incoming stock
4. `prepare_customer_shipment` → Generate shipping label
5. `ship_to_customer` → Hand off to carrier
6. `track_delivery` → Monitor tracking, update customer
7. `complete_order` → Mark delivered, request review

**Expected Duration**: 3-10 days (mostly waiting)

#### 6.2.4 `wf_handle_return` (Future)

**Purpose**: Process customer returns and refunds.

**Steps**:
1. `authorize_return` → Validate return policy eligibility
2. `generate_return_label` → Create shipping label
3. `await_return_receipt` → Wait for item arrival
4. `inspect_returned_item` → Quality check
5. `process_refund` → Issue refund to customer
6. `restock_or_discard` → Update inventory

**Expected Duration**: 5-14 days

### 6.3 Task Queue System (`src/queue/TaskQueue.ts`)

> **Reference**: See `TASK_QUEUE_SPEC.md` for complete specification.

**Purpose**: Reliable, distributed task execution with leasing, retries, and dead-letter handling.

**Architecture:**

```sql
CREATE TABLE task_queue (
  id UUID PRIMARY KEY,
  task_type VARCHAR(100) NOT NULL,       -- 'normalize_supplier_part', 'determine_fitment', etc.
  payload JSONB NOT NULL,                -- Task input data
  status VARCHAR(20) NOT NULL,           -- 'pending', 'leased', 'completed', 'failed', 'dead_letter'
  priority INT DEFAULT 5,                -- 1 (highest) to 10 (lowest)
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  lease_expires_at TIMESTAMP,            -- When current lease expires
  leased_by VARCHAR(100),                -- Worker ID that leased this task
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error JSONB                            -- Error details if failed
);

CREATE INDEX idx_task_queue_status_priority ON task_queue(status, priority, created_at);
CREATE INDEX idx_task_queue_lease_expires ON task_queue(lease_expires_at) WHERE status = 'leased';
```

**Task Lifecycle:**

1. **Enqueue**: Create task with status 'pending', priority, and payload
2. **Lease**: Worker claims task (status → 'leased', set lease_expires_at to now + 5 minutes)
3. **Heartbeat**: Worker extends lease periodically while processing (reset lease_expires_at)
4. **Complete**: Worker marks task 'completed' with result
5. **Fail**: On error, increment retry_count, reset status to 'pending' (with exponential backoff delay)
6. **Dead Letter**: After max_retries, mark 'dead_letter' for manual review

**Worker Implementation:**

```typescript
class TaskWorker {
  private workerId: string;
  private taskHandlers: Map<string, TaskHandler>;
  
  async start() {
    while (true) {
      // Lease next available task
      const task = await this.queue.lease({
        workerId: this.workerId,
        leaseDurationMs: 300000, // 5 minutes
        taskTypes: Array.from(this.taskHandlers.keys())
      });
      
      if (!task) {
        await this.sleep(1000); // No tasks, wait
        continue;
      }
      
      try {
        // Start heartbeat (extend lease every 60s)
        const heartbeat = setInterval(() => {
          this.queue.extendLease(task.id, 300000);
        }, 60000);
        
        // Execute task
        const handler = this.taskHandlers.get(task.task_type);
        const result = await handler(task.payload);
        
        // Mark completed
        await this.queue.complete(task.id, result);
        clearInterval(heartbeat);
      } catch (error) {
        // Handle failure
        await this.queue.fail(task.id, error);
      }
    }
  }
  
  async stop() {
    // Graceful shutdown: finish current task, then exit
  }
}
```

**Lease Recovery:**
- Background job runs every 60 seconds
- Finds tasks with status='leased' and lease_expires_at < NOW()
- Resets status to 'pending' (assumes worker crashed)
- These tasks become available for other workers

**Backoff Strategy:**
- Retry 1: Immediate
- Retry 2: 30 seconds delay
- Retry 3: 120 seconds delay
- After 3 retries: Dead letter

**Priority Queue:**
- Priority 1: Critical (customer support, order processing)
- Priority 3: High (new fitment determinations)
- Priority 5: Normal (bulk catalog ingestion)
- Priority 7: Low (SEO content regeneration)
- Priority 10: Background (memory consolidation, cleanup)

**Dead Letter Queue Handling:**
- Admin dashboard shows dead letter tasks
- Investigate error, fix issue (code bug, data quality, etc.)
- Retry manually or discard
- Learn from patterns to improve error handling

**Monitoring:**
- Queue depth by task type (alert if >1000 pending)
- Average task duration by type
- Worker health (active, idle, crashed)
- Retry rate by task type (high retry = investigate)
- Dead letter rate (should be <0.1%)  

---

## 7. MVP Scope & Implementation Checklist

**MVP Philosophy**: Ship the minimum viable system that proves the core value proposition—intelligent, automated car parts cataloging with fitment accuracy.

### 7.1 Backend MVP

#### 7.1.1 Database Schema ✓
- [x] **Core Tables**: vehicles, canonical_parts, supplier_parts, fitments, orders, order_lines
- [x] **Orchestration Tables**: workflows, workflow_steps, agent_events, task_queue
- [x] **Memory Tables**: memory_embeddings (pgvector)
- [x] **Migrations**: Version-controlled schema migrations (node-pg-migrate or Drizzle)
- [x] **Indexes**: All foreign keys, search columns, vector indexes (IVFFlat)
- [x] **Seed Data**: 1,000+ vehicles (popular makes/models 2015-2024), 10+ product categories

**Acceptance Criteria**: Can query "2018 Honda Civic" and find 50+ vehicle configurations

#### 7.1.2 API Layer ✓
- [x] **Vehicle API**
  - `GET /api/vehicles?year=2018&make=Honda&model=Civic` (cascade filtering)
  - `GET /api/vehicles/:id` (vehicle details)
- [x] **Product API**
  - `GET /api/products?vehicleId=xyz&category=brakes` (filtered by fitment)
  - `GET /api/products/:id?vehicleId=xyz` (includes fitment check)
  - `GET /api/products/:id/fitments` (reverse fitment table)
- [x] **Search API**
  - `GET /api/search?q=brake+pads&vehicleId=xyz` (full-text + semantic search)
- [x] **Order API**
  - `POST /api/orders` (create order)
  - `GET /api/orders/:id` (order details)
- [x] **Support API**
  - `WebSocket /api/support/chat` (real-time support chat)
- [x] **Admin API** (Basic)
  - `POST /api/admin/supplier-feeds` (upload supplier data)
  - `GET /api/admin/workflows` (monitor workflows)

**Acceptance Criteria**: All endpoints respond <200ms (p95), return correct data

#### 7.1.3 Supplier Ingestion Workflow ✓
- [x] **Workflow**: `wf_ingest_supplier_catalog` (7 stages, see Section 4.1)
- [x] **File Upload**: Support CSV upload (admin interface or API)
- [x] **CSV Parser**: Handle common formats (Excel-exported CSV, UTF-8, quoted fields)
- [x] **Error Handling**: Log parsing errors, continue processing valid rows

**Acceptance Criteria**: Can ingest 5,000-part supplier catalog in <2 hours, publish >70%

#### 7.1.4 AI Agents ✓

**SupplierNormalizationAgent**
- [x] Field mapping for common supplier formats (part_number, description, price, brand)
- [x] Handle missing data gracefully (use defaults, flag for review)
- [x] Success: >95% field extraction accuracy

**ProductDataAgent**
- [x] Exact match on part number + brand
- [x] Vector similarity search (cosine similarity, threshold 0.85)
- [x] Create new canonical part if no match
- [x] Merge specs from multiple suppliers
- [x] Success: <5% duplicate canonical parts

**FitmentAgent (MVP Strategy)**
- [x] **Rule-Based**: Universal parts, OEM number lookup, category rules
- [x] **Pattern Recognition**: Parse year ranges, make/model from descriptions (regex + NLP)
- [x] **LLM Fallback**: Claude Sonnet for ambiguous cases (structured output)
- [x] Confidence scoring (0.0 - 1.0)
- [x] Evidence tracking (store reasoning in fitment.evidence JSONB)
- [x] Success: >88% accuracy on gold dataset (lower bar for MVP, improve post-launch)

**PricingAgent**
- [x] Category-specific margin rules (configurable in code or DB)
- [x] Psychological pricing (.99 endings)
- [x] Minimum margin enforcement (15%)
- [x] Success: All prices profitable, no negative margins

**SEOAgent**
- [x] Title generation (55-60 chars, includes brand + part type + vehicle)
- [x] Meta description (150-160 chars, includes specs + CTA)
- [x] Product description (300-500 words, follows brand voice)
- [x] Use GPT-4 Turbo with few-shot examples from BRAND_GUIDE.md
- [x] Success: Readability score >60, no hallucinated facts

**SupportAgent**
- [x] Fitment inquiry handling (query DB, return confidence)
- [x] Product comparison (fetch specs, generate table)
- [x] Order status lookup (if authenticated)
- [x] General knowledge (use LLM with context)
- [x] Safety policy enforcement (no unsafe advice, see SUPPORT_POLICY.md)
- [x] Success: <5s response time, zero safety violations in testing

#### 7.1.5 LLM Router ✓
- [x] OpenAI integration (GPT-4 Turbo, GPT-4o, ada-002 embeddings)
- [x] Anthropic integration (Claude Sonnet, Opus)
- [x] Local LLM integration (Ollama: llama3.1, mistral) - optional for cost savings
- [x] Task routing logic (see Section 5.1 routing table)
- [x] Response caching (Redis, 5-minute TTL)
- [x] Cost tracking (log tokens, estimate USD)
- [x] Fallback strategy (retry, switch provider)

**Acceptance Criteria**: Routes tasks correctly, tracks costs, handles failures gracefully

#### 7.1.6 Vector Memory ✓
- [x] pgvector extension installed
- [x] memory_embeddings table with IVFFlat index
- [x] Store agent decisions, fitment reasoning, part descriptions
- [x] Semantic search API (cosine similarity, threshold 0.7)
- [x] Consolidation job (weekly, merge duplicates)

**Acceptance Criteria**: Can retrieve similar past decisions in <100ms

#### 7.1.7 Task Queue & Workers ✓
- [x] task_queue table with indexes
- [x] Lease mechanism (5-minute leases, heartbeat extension)
- [x] Worker pool (start with 5 workers, scale as needed)
- [x] Retry logic (exponential backoff, max 3 retries)
- [x] Dead letter queue handling
- [x] Priority queue support

**Acceptance Criteria**: Can process 100 tasks/minute, recover from worker crashes

#### 7.1.8 Orchestrator ✓
- [x] Workflow definition DSL
- [x] Step execution engine (sequential + parallel)
- [x] State persistence (checkpoint after each step)
- [x] Error handling (retry, rollback, halt)
- [x] Workflow status API

**Acceptance Criteria**: Can run `wf_ingest_supplier_catalog` end-to-end without manual intervention

### 7.2 Frontend MVP

#### 7.2.1 Core Pages ✓
- [x] **Homepage**: Hero with vehicle selector, featured categories, search bar
- [x] **Category Browse**: Grid view, filters (brand, price), sort options, vehicle filtering
- [x] **Product Detail**: Images, fitment check, specs, description, add to cart
- [x] **Cart**: View items, update quantities, proceed to checkout
- [x] **Checkout**: Shipping address, payment (Stripe), order confirmation
- [x] **Order Tracking**: Order status, tracking number, estimated delivery

**Acceptance Criteria**: User can browse, select vehicle, find part, complete purchase in <5 minutes

#### 7.2.2 Vehicle Selector ✓
- [x] Cascade dropdowns (Year → Make → Model → Trim)
- [x] "My Garage" feature (save multiple vehicles to localStorage)
- [x] Persistent selection (cookie + localStorage)
- [x] Quick vehicle switcher in header

**Acceptance Criteria**: Vehicle selection persists across pages and sessions

#### 7.2.3 Fitment UX ✓
- [x] Fitment badges on product cards (✓ Verified Fit, Likely Fit)
- [x] Prominent fitment section on product detail ("Fits Your 2018 Honda Civic")
- [x] Reverse fitment table (all compatible vehicles)
- [x] Confidence explanation ("Why we're confident this fits")

**Acceptance Criteria**: User clearly understands if part fits their vehicle before purchase

#### 7.2.4 Support Chat Widget ✓
- [x] Persistent chat bubble (bottom-right corner)
- [x] WebSocket real-time messaging
- [x] Context injection (page, vehicle, order)
- [x] Typing indicators, message history
- [x] Quick action buttons ("Does this fit my car?", "Track order")

**Acceptance Criteria**: User can get instant fitment answer in <10 seconds

#### 7.2.5 Design & UX ✓
- [x] Responsive design (mobile, tablet, desktop)
- [x] Tailwind CSS implementation
- [x] Brand colors and typography (per BRAND_GUIDE.md)
- [x] Accessibility (WCAG 2.1 AA: keyboard nav, screen reader, color contrast)
- [x] Performance (Lighthouse: >90 performance, >90 accessibility, >90 SEO)

**Acceptance Criteria**: Site is usable and fast on mobile devices

### 7.3 Evaluation MVP ✓

#### 7.3.1 Fitment Gold Dataset ✓
- [x] Manual verification of 200 part-vehicle pairs (diverse categories)
- [x] Balanced dataset (100 fits, 100 doesn't fit)
- [x] Storage in `fitment_gold_standard` table

**Acceptance Criteria**: Dataset covers top 10 vehicle models and top 5 part categories

#### 7.3.2 Evaluation Harness ✓
- [x] Automated test runner (run FitmentAgent on gold dataset)
- [x] Metrics calculation (accuracy, precision, recall, F1)
- [x] Confidence calibration analysis
- [x] CI/CD integration (run on every deploy)
- [x] Alert on regression (accuracy drops >2%)

**Acceptance Criteria**: Baseline accuracy >= 88% on gold dataset

#### 7.3.3 Other Evaluations ✓
- [x] Pricing sanity checks (margin >= 15%, price ends in .99)
- [x] SEO content quality (readability >60, title length 55-60)
- [x] Support agent safety (no unsafe advice in test scenarios)

**Acceptance Criteria**: All checks pass before deploying to production

### 7.4 MVP Non-Functional Requirements

#### 7.4.1 Performance ✓
- [x] API response time <200ms (p95)
- [x] Page load time <2s (p95)
- [x] Support chat response <5s (p95)
- [x] Workflow throughput: 1,000+ parts/hour

#### 7.4.2 Reliability ✓
- [x] 99% uptime (max 7.2 hours downtime/month)
- [x] Automated health checks
- [x] Graceful degradation (if LLM fails, show fallback message)

#### 7.4.3 Security ✓
- [x] HTTPS only
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React escaping, CSP headers)
- [x] Rate limiting (100 req/min per IP)
- [x] API key authentication for admin endpoints

#### 7.4.4 Observability ✓
- [x] Structured logging (Winston or Pino)
- [x] Error tracking (Sentry or similar)
- [x] Metrics dashboard (workflow status, agent performance, costs)
- [x] Alerting (email/Slack on critical failures)

### 7.5 MVP Deployment

#### 7.5.1 Infrastructure ✓
- [x] PostgreSQL 15 (managed: AWS RDS or DigitalOcean)
- [x] Redis 7 (managed: AWS ElastiCache or DigitalOcean)
- [x] Node.js backend (Docker container on AWS ECS, Fly.io, or Railway)
- [x] React frontend (static hosting on Vercel, Netlify, or Cloudflare Pages)
- [x] S3 or compatible (object storage for images, uploads)

**Acceptance Criteria**: Can deploy with single command, zero-downtime deploys

#### 7.5.2 CI/CD ✓
- [x] GitHub Actions or similar
- [x] Automated tests (unit, integration, E2E)
- [x] Evaluation harness (run on PR, block merge if fails)
- [x] Automated deployment to staging on merge to `develop`
- [x] Manual approval for production deployment

**Acceptance Criteria**: All tests pass, evaluation metrics green, deploy takes <10 minutes  

---

## 8. Post-MVP Roadmap (Future Enhancements)

**Guiding Principle**: MVP proves the concept; post-MVP scales it and adds revenue-generating features.

### 8.1 Phase 2: Scale & Optimization (Months 4-6)

#### 8.1.1 Qdrant Vector Database Migration
**Why**: pgvector performs well up to ~1M embeddings; beyond that, Qdrant offers better performance and features.
- Migrate memory_embeddings to Qdrant
- Implement hybrid search (semantic + keyword)
- Add metadata filtering (filter by date, agent, confidence)
- Batch embedding updates for efficiency

**Success Metric**: Vector search <50ms at 10M+ embeddings

#### 8.1.2 Automated Supplier API Sync
**Why**: Eliminate manual uploads; keep catalog fresh automatically.
- Build supplier API adapters (ACES/PIES, custom APIs)
- SFTP/FTP scheduled imports (nightly)
- Incremental sync (only changed parts)
- Automated inventory sync (stock levels, pricing updates)

**Success Metric**: 10+ suppliers syncing automatically, catalog updated daily

#### 8.1.3 Dynamic Pricing Intelligence
**Why**: Stay competitive and maximize margins automatically.
- Competitor price scraping (using Bright Data or similar)
- Machine learning pricing model (optimize for conversion + margin)
- A/B testing framework for pricing strategies
- Seasonal pricing adjustments

**Success Metric**: 5% margin improvement, maintain conversion rate

#### 8.1.4 Advanced FitmentAgent V2
**Why**: Improve accuracy from 88% to 95%+.
- Fine-tuned LLM on automotive domain (LoRA/QLoRA)
- Integrate OEM databases (AllData, Mitchell1)
- Community feedback loop (customers report incorrect fitments → retrain)
- Active learning (agent flags low-confidence fitments for human review)

**Success Metric**: >95% fitment accuracy, <1% false positive rate

### 8.2 Phase 3: Revenue Expansion (Months 7-12)

#### 8.2.1 Customer Accounts & Loyalty
- User registration and authentication
- Order history and re-ordering
- Saved garage (sync across devices)
- Wish lists and part reminders ("remind me to change oil in 3,000 miles")
- Loyalty points program

**Success Metric**: 30% of customers create accounts, 15% repeat purchase rate

#### 8.2.2 Admin Dashboard & Analytics
- Real-time operations dashboard (active workflows, agent performance)
- Business intelligence (top products, revenue by category, profit margins)
- Supplier performance tracking (order accuracy, fulfillment time)
- Customer support metrics (chat satisfaction, escalation rate)
- A/B testing results viewer

**Success Metric**: Make data-driven decisions weekly

#### 8.2.3 Marketplace API Integration
- Amazon listing agent (create/update product listings)
- eBay listing agent
- Walmart Marketplace integration
- Automatic inventory sync across channels
- Centralized order management

**Success Metric**: 25% revenue from marketplace channels

#### 8.2.4 Rich SEO Content Generation
- FAQ sections for each product
- "Compare X vs Y" pages (auto-generated)
- How-to guides and installation videos (text generation, future: video AI)
- Category landing pages with buying guides
- Blog with automotive tips (agent-written, human-edited)

**Success Metric**: 40% organic traffic from SEO, 20% increase in time-on-site

### 8.3 Phase 4: Advanced Automation (Months 13-18)

#### 8.3.1 Order Processing Workflow Automation
- Automated supplier order placement (via EDI or API)
- Real-time inventory tracking
- Predictive stocking (ML forecast demand, pre-order popular items)
- Automated shipping label generation
- Carrier selection optimization (cost vs. speed)

**Success Metric**: 95% orders fulfilled without human intervention

#### 8.3.2 Advanced Return & Warranty Management
- Automated return authorization (RMA workflow)
- Smart return routing (restock, refurbish, or discard)
- Warranty claim processing (coordinate with suppliers)
- Customer dispute resolution agent

**Success Metric**: <2% return rate, <24h RMA processing time

#### 8.3.3 Image Generation for Missing Photos
- AI image generation (Stable Diffusion, DALL-E) for parts without supplier photos
- Lifestyle image generation (part installed on vehicle)
- Image quality enhancement (upscaling, background removal)

**Success Metric**: 100% products have high-quality images

#### 8.3.4 Multi-Language Support
- Spanish, French, German storefronts
- Agent multilingual support (GPT-4 handles translation)
- Localized pricing and shipping

**Success Metric**: 10% revenue from non-English markets

### 8.4 Phase 5: Intelligence & Community (Months 19-24)

#### 8.4.1 Customer Review & Ratings System
- Post-purchase review requests
- Fitment verification ("Did this fit your vehicle?")
- Photo reviews with incentives
- Sentiment analysis (flag negative reviews for response)
- Aggregate ratings into product quality scores

**Success Metric**: 20% of customers leave reviews, 4.5+ avg rating

#### 8.4.2 Predictive Customer Support
- Proactive chat offers ("Need help finding parts?")
- Order status updates before customer asks
- Predict support needs based on browsing behavior
- Self-service knowledge base (agent-curated FAQs)

**Success Metric**: 30% reduction in support ticket volume

#### 8.4.3 Community Features
- Forums for vehicle enthusiasts ("2018 Honda Civic Owners")
- User-generated fitment confirmations (crowd-sourced accuracy)
- Build threads ("My brake upgrade project")
- Expert badges for active contributors

**Success Metric**: 10% DAU engage with community, improve fitment accuracy by 2%

#### 8.4.4 Subscription & Service Plans
- Maintenance subscription boxes ("Send me filters every 5,000 miles")
- Premium fitment guarantee ("Wrong part? We cover return shipping")
- Priority support for subscribers
- Fleet accounts for businesses

**Success Metric**: 5% of revenue from subscriptions, 85% retention rate

### 8.5 Technical Debt & Infrastructure (Ongoing)

- Microservices architecture (split monolith if needed)
- GraphQL API (replace/supplement REST)
- Kubernetes orchestration (if scaling beyond single-region)
- Multi-region deployment (CDN, database replicas)
- Advanced security (SOC 2 compliance, penetration testing)
- Mobile apps (iOS, Android) for garage management and shopping  

---

## 9. Explicit Non-Goals (MVP & Near-Term)

**Purpose**: Clarify what we are deliberately NOT building to maintain focus and ship quickly.

### 9.1 Full eCommerce Suite

**Not Building:**
- Tax calculation engine (use Stripe Tax or TaxJar API instead)
- Advanced shipping integrations (multi-carrier comparison, real-time rates)
- Automated shipping label generation (use ShipStation or EasyPost)
- Inventory management system (track supplier inventory, not our own)
- Automated refund processing (manual approval required)
- Gift cards, coupon codes, promotions engine
- Abandoned cart recovery emails

**Rationale**: These are commodity features. Use existing SaaS tools. Focus on our differentiator—intelligent fitment and automation.

**Workaround for MVP**: 
- Use Stripe for payments (includes basic tax calculation)
- Manual order fulfillment (place orders with suppliers manually)
- Manual refund approval via admin panel
- No promotions in MVP

**Future**: Integrate ShipStation (Phase 3), add promotions engine (Phase 4)

### 9.2 Vendor/Supplier Management Portal

**Not Building:**
- Supplier onboarding portal
- Supplier performance dashboards
- Supplier payment automation
- Supplier communication platform
- Supplier product catalog management UI

**Rationale**: MVP suppliers are managed manually. Portal is valuable but not critical for proving concept.

**Workaround for MVP**:
- Email suppliers for catalog updates
- Track supplier performance in spreadsheets
- Manual payment via ACH/check

**Future**: Build supplier portal (Phase 4) when we have 20+ suppliers

### 9.3 Real-Time Inventory Sync

**Not Building:**
- Live inventory checks across dozens of suppliers
- Out-of-stock prevention (oversell protection)
- Backorder management
- Dropship order status webhooks

**Rationale**: Real-time sync is complex and brittle. Batch sync (nightly) is sufficient for MVP.

**Workaround for MVP**:
- Show "Usually ships in 2-5 days" instead of "In Stock"
- Verify stock manually before placing supplier order
- Handle backorders reactively (email customer)

**Future**: Implement real-time inventory (Phase 3) for top 5 suppliers

### 9.4 Complex Multi-Node Scaling

**Not Building:**
- Kubernetes cluster with auto-scaling
- Multi-region deployment
- CDN for API responses
- Database sharding
- Microservices architecture

**Rationale**: Premature optimization. MVP can handle 10K orders/month on single server.

**Workaround for MVP**:
- Deploy to managed platform (Railway, Fly.io, AWS ECS)
- Vertical scaling (bigger server) before horizontal
- Use CDN for static assets only (frontend, images)

**Future**: Scale horizontally when we hit performance limits (Phase 4+)

### 9.5 Advanced ML Models (Fine-Tuned LLMs)

**Not Building:**
- Custom fine-tuned LLM for automotive domain
- Computer vision for part identification
- Recommendation engine (collaborative filtering)
- Demand forecasting ML models

**Rationale**: Off-the-shelf LLMs (GPT-4, Claude) are sufficient for MVP. Custom models are expensive and time-consuming.

**Workaround for MVP**:
- Use GPT-4/Claude with few-shot prompting
- Manual product recommendations ("Related Products")
- Simple rule-based forecasting

**Future**: Fine-tune models (Phase 4) when we have 100K+ labeled examples

### 9.6 Mobile Native Apps

**Not Building:**
- iOS app
- Android app
- Push notifications
- Offline mode

**Rationale**: Responsive web app covers 95% of use cases. Native apps are maintenance burden.

**Workaround for MVP**:
- Mobile-optimized responsive design
- PWA (Progressive Web App) with installability

**Future**: Consider native apps (Phase 5) if mobile usage >60% and user feedback demands it

### 9.7 Social Features (Beyond Community Forums)

**Not Building:**
- Social login (Facebook, Google OAuth)
- Share to social media
- User profiles with avatars and bios
- Follow/friend system
- Activity feeds

**Rationale**: Social features are nice-to-have but don't drive core business value for MVP.

**Workaround for MVP**:
- Email-only registration
- Simple share buttons (future)

**Future**: Add social login (Phase 3), community features (Phase 5)

### 9.8 White-Label / Multi-Tenant Platform

**Not Building:**
- Multi-brand storefronts (different domains, branding)
- Tenant isolation (separate databases per customer)
- Reseller platform

**Rationale**: Focus on single brand (AutoMechanica). Multi-tenancy is architectural complexity.

**Future**: Consider if we pursue B2B SaaS pivot (Phase 5+)

---

## 10. Definition of Success

**AutoMechanica MVP is successful when all criteria below are met.**

### 10.1 Technical Success Criteria

#### 10.1.1 Automation Completeness ✓
- [x] **Supplier Feed → Published Parts**: Fully automated pipeline (wf_ingest_supplier_catalog)
  - **Measured By**: Zero manual interventions required for standard catalog ingestion
  - **Target**: 70%+ parts published automatically (30% draft due to data quality is acceptable)
  
- [x] **Fitment Determination**: Automated with confidence scoring
  - **Measured By**: FitmentAgent processes parts without human labeling
  - **Target**: 88%+ accuracy on gold dataset, <3% false positives
  
- [x] **Pricing**: Rule-based pricing with competitive intelligence
  - **Measured By**: All published parts have valid, profitable prices
  - **Target**: 100% prices have >15% margin, 0% pricing errors
  
- [x] **SEO Content**: AI-generated descriptions meeting brand standards
  - **Measured By**: SEOAgent produces human-quality content
  - **Target**: >60 readability score, 0% factual errors in spot checks

#### 10.1.2 System Performance ✓
- [x] **API Response Times**: Fast enough for good UX
  - **Measured By**: p95 latency monitoring
  - **Targets**:
    - Product listing API: <200ms
    - Product detail API: <150ms
    - Search API: <300ms
    - Support chat: <5s to first response
    
- [x] **Workflow Throughput**: Can handle real supplier catalogs
  - **Measured By**: Parts processed per hour
  - **Target**: 1,000+ parts/hour (5,000-part catalog in <5 hours)
  
- [x] **Uptime**: Reliable service
  - **Measured By**: Uptime monitoring (Pingdom, UptimeRobot)
  - **Target**: 99%+ uptime (max 7.2 hours downtime/month)

#### 10.1.3 Cost Efficiency ✓
- [x] **LLM Costs**: Sustainable economics
  - **Measured By**: Cost per published part
  - **Target**: <$0.05 per part (SEO + Fitment + normalization combined)
  - **Context**: 5,000 parts = $250 LLM cost, acceptable for MVP
  
- [x] **Infrastructure Costs**: Lean operations
  - **Measured By**: Monthly AWS/hosting bill
  - **Target**: <$500/month for MVP scale (10K products, 1K orders/month)

#### 10.1.4 Data Quality ✓
- [x] **Canonical Part Deduplication**: Minimal duplicate parts
  - **Measured By**: Manual audit of random 100 parts
  - **Target**: <5% duplicates (same part represented multiple times)
  
- [x] **Fitment Confidence Calibration**: Confidence scores are accurate
  - **Measured By**: Calibration analysis (do 90% confidence fitments actually fit 90%?)
  - **Target**: Within ±5% (85-95% actual for 90% predicted)
  
- [x] **Catalog Completeness**: Products have rich data
  - **Measured By**: Average quality score across published parts
  - **Target**: Average quality score >75 (out of 100)

### 10.2 User Experience Success Criteria

#### 10.2.1 Core User Journey ✓
**A user can complete this flow without friction:**

1. **Land on homepage**
2. **Select vehicle** (2018 Honda Civic LX)
3. **Browse category** (Brakes → Brake Pads)
4. **See fitment-filtered results** (only compatible parts)
5. **View product detail** (clear fitment badge, specs, description)
6. **Add to cart**
7. **Checkout** (enter shipping, payment)
8. **Receive order confirmation** (email + order tracking page)
9. **Ask Support Agent** ("Does this fit my car?") and get instant answer

**Measured By**: User testing with 10 target users
**Target**: 8/10 users complete purchase without confusion or assistance

#### 10.2.2 Fitment Clarity ✓
- [x] **Fitment Badges**: Users understand what fits
  - **Measured By**: User survey ("Did you feel confident this part fits?")
  - **Target**: >85% answer "Yes, very confident" or "Somewhat confident"
  
- [x] **Reverse Fitment Table**: Users can see all compatible vehicles
  - **Measured By**: Click-through rate on "View All Compatible Vehicles"
  - **Target**: >30% users expand to view full list

#### 10.2.3 Support Agent Effectiveness ✓
- [x] **Response Quality**: Agent provides helpful answers
  - **Measured By**: Thumbs up/down on responses
  - **Target**: >80% positive feedback
  
- [x] **Deflection Rate**: Agent handles queries without human escalation
  - **Measured By**: % conversations that escalate to human
  - **Target**: <20% escalation rate
  
- [x] **Safety**: Agent never provides unsafe advice
  - **Measured By**: Manual review of 100 random conversations
  - **Target**: Zero safety violations (e.g., no instructions to replace airbags)

#### 10.2.4 Performance Perception ✓
- [x] **Page Load Speed**: Site feels fast
  - **Measured By**: Lighthouse scores
  - **Targets**: Performance >90, Accessibility >90, SEO >90
  
- [x] **Mobile Experience**: Usable on phone
  - **Measured By**: Mobile-specific user testing
  - **Target**: Complete purchase flow on mobile without frustration

### 10.3 Business Success Criteria

#### 10.3.1 MVP Validation Metrics
- [x] **Catalog Size**: Sufficient product breadth
  - **Measured By**: Count of published canonical parts
  - **Target**: >10,000 published parts across top 10 categories
  
- [x] **Vehicle Coverage**: Sufficient market coverage
  - **Measured By**: Count of vehicles with >100 compatible parts
  - **Target**: >500 popular vehicles (2015-2024 models) well-covered
  
- [x] **Order Completion**: Can process real orders
  - **Measured By**: Test orders placed and fulfilled
  - **Target**: 10 test orders successfully placed, tracked, and "delivered"

#### 10.3.2 Go-To-Market Readiness
- [x] **Brand Identity**: Professional, trustworthy appearance
  - **Measured By**: Brand audit against BRAND_GUIDE.md
  - **Target**: All pages follow brand guidelines (colors, voice, messaging)
  
- [x] **Legal Compliance**: Terms, privacy, disclaimers in place
  - **Measured By**: Legal review checklist
  - **Target**: Terms of Service, Privacy Policy, Return Policy published and compliant
  
- [x] **SEO Foundation**: Discoverable by search engines
  - **Measured By**: Google Search Console indexing
  - **Target**: >90% of product pages indexed by Google within 30 days

#### 10.3.3 Launch Metrics (First 3 Months)
**These are success indicators post-launch, not MVP blockers:**

- **Traffic**: 1,000+ unique visitors/month (organic + paid)
- **Conversion Rate**: 1-3% of visitors place orders
- **Average Order Value**: $75-150
- **Customer Satisfaction**: >4.0 stars (via post-purchase survey)
- **Return Rate**: <5% (indicates good fitment accuracy)
- **Support Load**: <10% of orders require human support

### 10.4 Documentation & Extensibility Success Criteria

#### 10.4.1 Autonomous Development Readiness ✓
- [x] **Complete Documentation**: AI agents can understand system
  - **Measured By**: All markdown docs in `/docs` complete and accurate
  - **Target**: 
    - MAIN_PLAN.md (this document) ✓
    - ARCHITECTURE_OVERVIEW.md ✓
    - DOMAIN_MODEL.md ✓
    - AGENTS.md ✓
    - API_REFERENCE.md ✓
    - INSTALLATION.md ✓
    - All other referenced docs exist
  
- [x] **Code Quality**: Clean, maintainable codebase
  - **Measured By**: Code review checklist
  - **Target**:
    - Follows CODE_STYLE_AND_CONVENTIONS.md
    - 80%+ test coverage on core logic
    - All functions have JSDoc comments
    - No critical linting errors
  
- [x] **Extensibility**: Easy to add new agents/workflows
  - **Measured By**: Time to add a new agent
  - **Target**: Junior dev can add new agent following docs in <4 hours

#### 10.4.2 Observability & Debugging ✓
- [x] **Logging**: Can trace any request or workflow
  - **Measured By**: Structured logs with request IDs
  - **Target**: Can reconstruct any workflow execution from logs
  
- [x] **Metrics**: Can measure system health
  - **Measured By**: Monitoring dashboard exists
  - **Target**: Real-time view of workflows, agent performance, errors, costs
  
- [x] **Error Tracking**: Can identify and fix issues quickly
  - **Measured By**: Error tracking tool (Sentry) integrated
  - **Target**: All uncaught errors logged with stack traces and context

### 10.5 Final Go/No-Go Checklist

**MVP is ready to launch when:**

- ☐ All technical success criteria met (Section 10.1)
- ☐ User testing completed with >80% success rate (Section 10.2.1)
- ☐ Fitment accuracy >88% on gold dataset (Section 10.1.1)
- ☐ Support agent passes safety evaluation (Section 10.2.3)
- ☐ All documentation complete (Section 10.4.1)
- ☐ 10 test orders successfully processed (Section 10.3.1)
- ☐ Legal compliance checklist complete (Section 10.3.2)
- ☐ Infrastructure can handle 10x current load (load testing)
- ☐ Monitoring and alerting configured (Section 10.4.2)
- ☐ Backup and disaster recovery plan tested
- ☐ Team trained on operations (order processing, support escalation)

**When all checkboxes are checked, AutoMechanica is ready for beta launch.**

---

## 11. Vision Statement (The North Star)

**AutoMechanica aspires to become the most intelligent, trustworthy, and effortless way to buy automotive parts online.**

**In 5 years, we envision:**

- **For Customers**: "I found the exact part I needed in 30 seconds, and it fit perfectly"
  - Zero fitment errors (99.9%+ accuracy)
  - Sub-10-second search-to-cart journey
  - Proactive maintenance reminders ("Your brake pads are due")
  - Trusted brand synonymous with quality and reliability

- **For the Industry**: "AutoMechanica proved AI can solve the fitment problem"
  - Industry-leading fitment technology (licensed to competitors)
  - Largest automotive parts knowledge graph
  - Gold standard for catalog data quality
  - Platform for suppliers to reach customers intelligently

- **For the Business**: "We built a self-operating, profitable, scalable platform"
  - $10M+ annual revenue
  - 30%+ gross margin
  - 95%+ operations automated (minimal human intervention)
  - Expanding into adjacent verticals (heavy equipment, industrial parts)

**How We Get There:**
1. **Ship MVP** (this document)—prove the core concept works
2. **Achieve product-market fit**—iterate based on real customer feedback
3. **Scale operations**—automate everything, grow catalog to 100K+ parts
4. **Build moats**—fitment accuracy, customer trust, supplier relationships
5. **Expand strategically**—new categories, new markets, new revenue streams

**AutoMechanica is not just a dropshipping store. It's the future of automotive commerce—intelligent, autonomous, and customer-obsessed.**

---

# End of MAIN_PLAN.md

**Document Version**: 2.0 (Comprehensive Rewrite)  
**Last Updated**: 2024-11-27  
**Maintained By**: AutoMechanica Core Team  
**Next Review**: After MVP launch or every 3 months

**For AI Agents**: This document is your source of truth. When in doubt, refer here. When you find gaps, flag them for update. When you achieve a milestone, check it off. You are empowered to build AutoMechanica autonomously—this plan sets you up for success.

