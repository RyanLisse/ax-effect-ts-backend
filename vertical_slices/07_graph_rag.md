# Slice 7: Graph RAG
## Objective
Enable graph-based retrieval and expansion by introducing nodes and edges structures, supporting multi-hop context expansion.
## Context
Complex documents often have implicit relationships that linear chunking cannot capture. This slice introduces a graph database representation to store knowledge nodes and edges, enabling 1–2 hop retrieval for broader context. It's optional but powerful for domain-specific knowledge graphs.
## Requirements
- Functional: Create new tables `nodes`, `edges`, and `node_chunks`; implement `IGraphRetriever` to expand context around a query or node id.
- Functional: Add API `/api/graph/expand` to retrieve related nodes, edges, and chunks.
- Non-functional: Support configurable hop limits; ensure performance with indexes; maintain referential integrity.
## Implementation Tasks
1. Graph Schema (Complexity: 4/10)
   - Use Drizzle to define tables: `nodes` (id, label, metadata), `edges` (id, from, to, type), `node_chunks` (node_id, chunk_id, weight).
   - Write migrations and create indexes for foreign keys.
2. Graph Retrieval Logic (Complexity: 5/10)
   - Implement `IGraphRetriever.retrieveGraphContext` that given a query uses hybrid retrieval to find initial chunks, maps them to nodes via node_chunks, and traverses edges up to N hops.
   - Normalize and rank resulting chunks.
3. API & Tests (Complexity: 4/10)
   - Add `/api/graph/expand` endpoint to call graph retriever; accept parameters like nodeId or query.
   - Write integration tests for graph expansion on a synthetic mini-graph.
## Implementation Details
```
// lib/graph.ts
export interface IGraphRetriever {
  retrieveGraphContext(query: string, nodeLimit: number, hopChunkLimit: number): Promise<Ranked[]>;
}
```
## Error Handling
- Validate hop limits and node ids; return 400 for invalid input.
- Use transactions to ensure consistency when inserting nodes/edges.
- Catch DB errors and return meaningful messages.
## Testing
- Unit tests for graph traversal logic on an in-memory graph.
- Integration tests verifying that retrieved context includes expected nodes/chunks.
