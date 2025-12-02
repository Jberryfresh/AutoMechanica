# DATABASE_MANAGEMENT.md

# AutoMechanica - Database Management Guide

Local development uses PostgreSQL with the pgvector extension via Docker Compose. Defaults match the values in `.env.example`.

## Services & Credentials
- Image: `pgvector/pgvector:pg16`
- Service names: `postgres` (required), `pgadmin` (optional, profile `pgadmin`)
- Defaults: `POSTGRES_USER=automechanica`, `POSTGRES_PASSWORD=dev_password`, `POSTGRES_DB=automechanica`, `POSTGRES_PORT=5432`
- pgAdmin defaults: `PGADMIN_DEFAULT_EMAIL=admin@automechanica.local`, `PGADMIN_DEFAULT_PASSWORD=changeme`, `PGADMIN_PORT=5050`

## Common Commands
- Start database: `npm run db:start`
- Stop database: `npm run db:stop`
- Restart database: `npm run db:restart`
- View logs (follow): `npm run db:logs`
- Reset data (destroys volume): `npm run db:reset`
- Open psql shell: `npm run db:shell`
- Connection test + pgvector check: `npm run db:test --workspace @automechanica/backend`
- Start pgAdmin UI: `npm run pgadmin:start` then open `http://localhost:5050`
- Stop pgAdmin UI: `npm run pgadmin:stop`

Data is persisted in the named volume `postgres_data`. Resetting removes this volume and recreates the database.

## pgvector Usage
- Extension is enabled via `scripts/init-db.sql` (`CREATE EXTENSION IF NOT EXISTS vector;`).
- Verify extension: `\dx` inside `psql` or `SELECT extversion FROM pg_extension WHERE extname = 'vector';`.
- Vector type: `vector(<dimensions>)` (e.g., `vector(1536)`).
- Similarity operators: `<->` (L2), `<#>` (negative inner product), `<=>` (cosine distance).
- Indexing (for future migrations): use `ivfflat` or `hnsw` depending on query patterns (see `VECTOR_MEMORY_DESIGN.md`).

## Troubleshooting
- Port 5432 in use: stop other Postgres instances or change `POSTGRES_PORT` in `.env`.
- Container unhealthy: check logs with `npm run db:logs` and ensure Docker has enough memory/CPU.
- pgvector missing: run `npm run db:test --workspace @automechanica/backend` and ensure `scripts/init-db.sql` is mounted; rerun `npm run db:reset` if needed.
- Authentication failures: confirm `.env` matches the credentials used by Docker Compose.
- Need a clean slate: `npm run db:reset` (destroys all local data).

## Backup & Restore (local)
- Backup: `docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql`
- Restore: `cat backup.sql | docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB`

For production or managed databases, ensure pgvector is available and follow provider-specific backup/restore tooling.
