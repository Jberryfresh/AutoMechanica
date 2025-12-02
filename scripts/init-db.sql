-- Initialize PostgreSQL for AutoMechanica local development
-- Enables the pgvector extension so vector columns can be used in migrations.

CREATE EXTENSION IF NOT EXISTS vector;

-- Quick verification to confirm the extension is available.
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
