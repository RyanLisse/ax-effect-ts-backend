# Slice 1 — Bootstrap, Env, and Database

## Goal
Project scaffolding, **Zod** env validation, **Drizzle ORM** with Postgres+pgvector + `pg_trgm`.

## Deliverables
- Hono+Effect skeleton; EnvSchema parsed on boot; Drizzle Kit migrations applied.
- Tables: `documents`, `chunks` with HNSW index; seed script.

## Steps
1. Init repo: `pnpm -w dlx create-hono`, add Effect, AI SDK, Drizzle.
2. Create `EnvSchema` (Zod) and config layer; fail fast if invalid.
3. Docker Compose for Postgres + pgvector. Run `drizzle-kit generate && drizzle-kit push`.
4. Health route `/health` with DB connectivity check.
