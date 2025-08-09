# Slice 7 — Graph RAG (Optional)

## Goal
Nodes/edges store, 1‑2 hop expansion, map to chunks via `node_chunks` weights.

## Deliverables
- `/graph/expand` route; `IGraphRetriever` adapter.
- Migrations for `nodes`, `edges`, `node_chunks`.

## Steps
1. Implement simple label+relation graph schema.
2. BFS up to 2 hops; collect related chunks.
3. Tests: mini‑graph fixture; assert hop coverage and rank merge.
