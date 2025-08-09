# Slice 3 — Embeddings & Storage

## Goal
Embed chunks using AI SDK → store vectors via Drizzle.

## Deliverables
- Embedder port + OpenAI adapter; batch `embedMany` with concurrency guard.
- Migration ensures `embedding` vector + HNSW index.
- Backfill job for unembedded chunks.

## Steps
1. `IEmbedder.embedMany` + adapter using `@ai-sdk/openai` with text-embedding-3-small.
2. Batch size 64; retry with backoff; record embedding time.
3. Tests: deterministic embeddings call with mocked provider.
