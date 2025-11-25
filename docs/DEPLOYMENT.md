# DEPLOYMENT.md

# AutoMechanica — Deployment Guide

This document defines the full deployment process for running AutoMechanica in production.  
Codex must follow these instructions when generating deployment scripts and infrastructure templates.

The goal of deployment:  
**Reliable, scalable, secure, and cost-efficient production environment.**

---

# 1. Overview of the Deployment Architecture

AutoMechanica production stack includes:

- **Backend API** (Node.js, TypeScript)
- **Task Workers** (Fitment, Pricing, SEO, Support, Order, Embedding)
- **PostgreSQL + pgvector**
- **Frontend** (React, served as static)
- **LLM Providers** (OpenAI, Anthropic, local models)
- **Reverse Proxy / Load Balancer** (NGINX or cloud equivalent)
- **Optional: Docker or Kubernetes**

---

# 2. Deployment Options

### **Option A — Docker Compose (Recommended for simplicity)**  
Great for small-to-medium deployments.

### **Option B — Kubernetes (Recommended for scaling)**  
High-end production scaling with autoscheduling & workload separation.

### **Option C — Bare Metal / VM Deployment**  
Manual setup; suitable for single-server deployments.

The deployment guide includes instructions for each.

---

# 3. Environment Variables (Production)

Required ENV:

```
NODE_ENV=production
PORT=3001

DATABASE_URL=postgres://user:pass@db:5432/automechanica

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_HOST=http://ollama:11434

EMBEDDING_MODEL=text-embedding-3-large

LOG_LEVEL=info
```

---

# 4. Production Build Steps

## Backend Build

```
cd backend
npm install --production
npm run build
```

Workers must also be built:

```
npm run build:workers
```

---

## Frontend Build

```
cd frontend
npm install --production
npm run build
```

The output (dist or .next/export) is served via NGINX or CDN.

---

# 5. Docker Deployment (Option A)

Codex should generate a `docker-compose.yml` similar to:

```
version: "3.9"
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: automechanica
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/automechanica
    ports:
      - "3001:3001"

  workers:
    build: ./backend
    command: npm run worker:all
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"

volumes:
  postgres_data:
```

### Running deployment:

```
docker compose up --build -d
```

---

# 6. NGINX Reverse Proxy (Production)

Example configuration:

```
server {
  listen 80;

  server_name automechanica.com;

  location /api/ {
    proxy_pass http://localhost:3001/;
  }

  location / {
    root /var/www/automechanica/frontend;
    try_files $uri /index.html;
  }
}
```

HTTPS should be configured with Certbot or cloud provider.

---

# 7. Kubernetes Deployment (Option B)

Core Kubernetes objects Codex may generate:

- `Deployment` for backend  
- `Deployment` for workers  
- `StatefulSet` for Postgres  
- `Service` objects  
- `Ingress` for routing  
- ConfigMaps + Secrets  

Autoscaling for workers recommended.

---

# 8. Database Maintenance

### Backups

Enable scheduled dumps:

```
pg_dump automechanica > backup.sql
```

Or use managed services with automatic snapshots.

### Migrations

```
npm run migrate
```

---

# 9. Logging & Monitoring

### Logging
- Structured JSON logging (pino or winston)
- Log levels: info, warn, error

### Monitoring
- Health endpoint: `/api/health`
- Worker heartbeat checks
- pgvector performance metrics
- API rate limits

### Optional:
- Prometheus & Grafana
- Sentry for error tracking

---

# 10. Security Requirements

- HTTPS required
- No secrets in Git
- Env vars in secure vault (AWS SSM / GCP Secrets)
- Database secured behind firewall/VPC
- CORS locked to frontend domain
- No direct DB exposure to internet

---

# 11. CDN Configuration (Frontend Optimization)

Serve static assets via:
- Cloudflare
- AWS CloudFront
- Vercel static hosting (if Next.js)

Features:
- Asset caching
- Brotli compression
- Tiered caching for images

---

# 12. Scaling Strategy

### Horizontal scaling:
- Multiple backend replicas
- Multiple worker replicas
- Auto-restart on crash

### Vertical scaling:
- Increase machine CPU/RAM
- Postgres tuning (work_mem, shared_buffers)

---

# 13. Deployment Checklist

- [ ] ENV configured  
- [ ] Backend built  
- [ ] Frontend built  
- [ ] Workers deployed  
- [ ] Postgres running  
- [ ] pgvector enabled  
- [ ] Reverse proxy configured  
- [ ] HTTPS enabled  
- [ ] Health check passes  
- [ ] Logs clean  

---

# End of DEPLOYMENT.md
