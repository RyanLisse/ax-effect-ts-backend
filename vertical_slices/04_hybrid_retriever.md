# Slice 4 — Hybrid Retriever

## Goal
Semantic (pgvector cosine) + Lexical (`pg_trgm`) + weighted merge.

## Deliverables
- `IRetriever.retrieve(q, topK)` returning Ranked[].
- SQL view or server-side merge with normalized scores.

## Steps
1. Implement Drizzle queries for vector & trigram matches.
2. Normalize scores to [0,1]; weighted sum default 0.7/0.3.
3. Tests: known corpus queries; assert ordering and coverage.
