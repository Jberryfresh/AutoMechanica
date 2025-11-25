# ENV_SETUP_GUIDE.md

# AutoMechanica — Environment Setup & Configuration Guide

This document provides the complete instructions for setting up the AutoMechanica development environment.  
Codex must generate and maintain installation instructions following this specification.

---

# 1. System Requirements

### **Operating System**
- Linux (preferred)
- macOS (supported)
- Windows (supported, WSL recommended)

### **Core Dependencies**
- Node.js (LTS)
- npm or pnpm
- PostgreSQL (14+)
- pgvector extension
- Docker (optional but recommended)
- Git
- Python (optional for tooling)

---

# 2. Repository Structure Overview

The project consists of:

```
/backend
/frontend
/docs
/scripts
```

The backend uses:
- TypeScript
- Postgres
- pgvector
- LLM Router
- Task Queue
- Orchestrator

The frontend uses:
- React
- TailwindCSS
- Vehicle-aware routing
- Support agent integration

---

# 3. Environment Variables

Codex must generate a `.env.example` file with:

```
# Database
DATABASE_URL=postgres://user:password@localhost:5432/automechanica

# LLM Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_HOST=http://localhost:11434

# Embeddings
EMBEDDING_MODEL=text-embedding-3-large

# App configs
NODE_ENV=development
PORT=3000
```

Notes:
- `.env` must never be committed
- Users must copy `.env.example` → `.env` and fill in secrets

---

# 4. Database Setup

### **4.1 Install Postgres**
Linux example:

```
sudo apt update
sudo apt install postgresql postgresql-contrib
```

macOS:

```
brew install postgresql
```

### **4.2 Create Database**

```
createdb automechanica
```

### **4.3 Enable pgvector**

Inside Postgres:

```
CREATE EXTENSION IF NOT EXISTS vector;
```

### **4.4 Run Migrations**

Codex must generate migration commands such as:

```
npm run migrate
```

---

# 5. Running the Backend

### **5.1 Install Dependencies**

```
cd backend
npm install
```

### **5.2 Development Mode**

```
npm run dev
```

### **5.3 Start Task Workers**

Start one worker per agent group:

```
npm run worker:fitment
npm run worker:pricing
npm run worker:seo
npm run worker:support
```

Or a single unified worker:

```
npm run worker:all
```

Codex must generate these scripts.

---

# 6. Running the Frontend

### **6.1 Install**

```
cd frontend
npm install
```

### **6.2 Development Mode**

```
npm run dev
```

### **6.3 Production Build**

```
npm run build
npm run preview
```

Frontend depends on backend API availability.

---

# 7. Optional Docker Setup

Codex may generate `docker-compose.yml` with:

- postgres
- backend API
- worker processes
- frontend (static)

Example snippet:

```
version: "3.9"
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: automechanica
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
```

---

# 8. Verification Checklist

After setup:

- [ ] Can connect to Postgres  
- [ ] `vector` extension installed  
- [ ] LLM keys loaded  
- [ ] Backend runs  
- [ ] Workers run  
- [ ] Frontend runs  
- [ ] API responds at `/api/health`  

Codex must generate `/api/health`.

---

# 9. Common Troubleshooting

### **Postgres won’t start**
Check logs:
```
sudo journalctl -u postgresql
```

### **pgvector missing**
Ensure:
```
CREATE EXTENSION vector;
```

### **LLM key missing**
Check `.env` or environment manager.

---

# End of ENV_SETUP_GUIDE.md
