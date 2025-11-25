# INSTALLATION.md

# AutoMechanica — Installation Guide

This document provides step‑by‑step instructions for installing all components of the AutoMechanica system: backend, frontend, database, vector memory, and development tooling.

Codex must generate and maintain this guide consistently as the codebase evolves.

---

# 1. Prerequisites

Before installing AutoMechanica, ensure the following are installed:

### **System Requirements**
- Linux (recommended), macOS, or Windows with WSL
- At least 8GB RAM (16GB recommended)
- At least 20GB disk space
- Stable internet connection

### **Required Tools**
- Node.js (LTS version)
- npm or pnpm
- PostgreSQL 14+  
- pgvector extension
- Git
- Docker (optional, recommended)
- Python (optional for tooling)
- curl or wget (for API testing)

---

# 2. Clone the Repository

```
git clone https://github.com/<your-username>/automechanica.git
cd automechanica
```

---

# 3. Environment Variables

Copy the example file:

```
cp .env.example .env
```

Fill in:

```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=postgres://user:password@localhost:5432/automechanica
EMBEDDING_MODEL=text-embedding-3-large
```

Never commit `.env`.

---

# 4. Database Setup

### **4.1 Install Postgres**

Linux:

```
sudo apt update
sudo apt install postgresql postgresql-contrib
```

macOS:

```
brew install postgresql
```

### **4.2 Create database**

```
createdb automechanica
```

### **4.3 Enable pgvector**

Inside `psql`:

```
CREATE EXTENSION IF NOT EXISTS vector;
```

### **4.4 Migrate Schema**

Codex must generate migration scripts. Example:

```
cd backend
npm run migrate
```

---

# 5. Backend Installation

```
cd backend
npm install
npm run dev
```

Your backend API will be available at:

```
http://localhost:3001
```

Check health:

```
curl http://localhost:3001/api/health
```

---

# 6. Task Workers

Workers process queue tasks for:

- Fitment Agent  
- Pricing Agent  
- SEO Agent  
- Support Agent  
- Order Agent  
- Supplier ingestion  
- Embedding worker  

Start all workers:

```
npm run worker:all
```

Or run individually:

```
npm run worker:fitment
npm run worker:pricing
npm run worker:seo
npm run worker:support
```

Workers must be running for workflows to function.

---

# 7. Frontend Installation

```
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

# 8. Optional: Run Entire Stack via Docker

Codex may generate a `docker-compose.yml` like:

```
docker compose up --build
```

This launches:
- Postgres
- Backend API
- Workers
- Frontend (static build)

---

# 9. Testing Installation

### Backend Tests

```
cd backend
npm run test
```

### Frontend Tests

```
cd frontend
npm run test
```

---

# 10. Common Issues & Fixes

### **Postgres authentication failed**
Make sure your `pg_hba.conf` allows md5 or scram-sha-256.

### **pgvector not installed**
Run:

```
CREATE EXTENSION vector;
```

### **CORS errors on frontend**
Codex must configure backend CORS properly.

### **Workers not processing tasks**
Check:
- Database connection
- Queue visibility
- Worker logs

---

# 11. Verification Checklist

- [ ] Backend running  
- [ ] Frontend running  
- [ ] Database connection verified  
- [ ] pgvector installed  
- [ ] LLM keys loaded  
- [ ] Task workers running  
- [ ] `/api/health` returns OK  

---

# End of INSTALLATION.md
