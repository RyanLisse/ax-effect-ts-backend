# Slice 1: Bootstrap, Env, and Database
## Objective
Establish the initial project scaffold with environment validation and database setup for a typed RAG system.
## Context
This slice lays the foundation for our RAG backend by setting up a Hono + Effect skeleton, validating environment variables with Zod, and configuring Drizzle ORM against a Postgres database with pgvector and pg_trgm extensions. It ensures our configuration is type-safe and fails fast at startup. Without this foundation, subsequent slices cannot persist documents or store embeddings.
## Requirements
- Functional: Setup Hono server and Effect container; implement a Config layer that parses and validates environment variables via Zod; connect to Postgres using Drizzle and create tables `documents` and `chunks` with the appropriate vector and trigram indexes.
- Functional: Provide a `/health` endpoint that checks DB connectivity.
- Non-functional: Use TypeScript everywhere; ensure env validation fails fast; handle DB connection errors gracefully; follow TDD by writing tests before implementing.
## Implementation Tasks 
1. Repository Bootstrap (Complexity: 2/10)
   - Initialize PNPM workspace with Hono, Effect, Drizzle, Zod, and testing libraries (Vitest).
   - Configure TSConfig, ESlint, Prettier. Commit with conventional commit `feat(core): bootstrap project`.
2. Environment & Config Layer (Complexity: 4/10)
   - Write a Zod schema (`EnvSchema`) for required env vars (e.g., DATABASE_URL, OPENAI_API_KEY, EMBED_DIM).
   - Implement an Effect `ConfigService` that loads .env and validates via `EnvSchema`.
   - Write unit tests ensuring invalid env fails at runtime.
3. Database & Drizzle Setup (Complexity: 5/10)
   - Add Drizzle config with Postgres driver and generate migration scripts for tables `documents` and `chunks` including pgvector and pg_trgm indexes.
   - Write migration and seed script. Implement repository methods for inserting documents/chunks.
   - Create integration tests against a local Postgres using testcontainers.
4. Health Endpoint (Complexity: 3/10)
   - Implement `/health` route returning status from DB connection and config validation.
   - Add integration test to ensure endpoint returns 200 and error handling returns 500.
## Implementation Details
```
// lib/config.ts
import { z } from "zod";
export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  EMBED_DIM: z.number().default(1536),
});
export type Env = z.infer<typeof EnvSchema>;

// app/config.ts (Effect layer)
import { Context, Effect } from "effect";
export const ConfigService = Context.Tag<Env>("ConfigService");
export const provideConfig = Effect.succeedWith(() => {
  const parsed = EnvSchema.parse(process.env);
  return ConfigService.of(parsed);
});
```
## Error Handling
- Wrap database initialization in try/catch; log errors and exit process if config is invalid.
- Use Effect’s `Either` or `Exit` to surface validation errors.
- Log with pino or console but avoid leaking secrets.
## Testing
- Use Vitest for unit tests of the config loader and DB repo functions.
- Use Testcontainers to spin up a Postgres container for integration tests and verify migrations run and `/health` returns ok.
- Ensure tests run in CI and pass before merging.
