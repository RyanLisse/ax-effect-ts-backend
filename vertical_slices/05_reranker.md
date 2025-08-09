# Slice 5 — Reranker (Optional, Feature Flag)

## Goal
Cohere Rerank v3.5 to reorder candidates.

## Deliverables
- `IReranker` + adapter; circuit breaker and QPS cap; flag `RERANK_ENABLED`.

## Steps
1. REST call with { query, documents }.
2. Merge reranked scores back; keep topK.
3. Tests: provider mocked; ensure stability when disabled or timed out.
