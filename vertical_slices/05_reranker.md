# Slice 5: Reranker
## Objective
Enhance retrieval quality by reordering candidate chunks using a third-party reranking service (Cohere).
## Context
Sometimes the initial hybrid retrieval returns relevant but suboptimal ranking. A reranker can refine this ordering based on deeper semantic similarity. This slice adds an optional reranking stage behind a feature flag to reorder top results.
## Requirements
- Functional: Implement `IReranker.rerank(query: string, candidates: Ranked[]): Promise<Ranked[]>` using Cohere Rerank API.
- Functional: Integrate the reranker into the retrieval flow behind environment flag `RERANK_ENABLED`.
- Non-functional: Respect API rate limits; handle timeouts; ensure fallback to original ranking when disabled or errors occur.
## Implementation Tasks
1. Reranker Adapter (Complexity: 4/10)
   - Define `IReranker` interface; implement `CohereReranker` that calls Cohere's endpoint with query and candidate texts.
   - Map returned ranks back to original Ranked objects and return the sorted array.
2. Feature Flag Integration (Complexity: 2/10)
   - Read `RERANK_ENABLED` from config; wrap retrieval logic to call reranker when enabled.
   - Provide metrics to compare reranked vs baseline ranking.
3. Testing (Complexity: 3/10)
   - Mock Cohere API to return deterministic ordering; test that reranked output matches expected.
   - Verify that when the flag is false or API errors occur, the original ranking is returned unchanged.
## Implementation Details
```
// lib/reranker.ts
export interface IReranker { rerank(q: string, candidates: Ranked[]): Promise<Ranked[]>; }
export class CohereReranker implements IReranker {
  constructor(private cohereApiKey: string) {}
  async rerank(query: string, candidates: Ranked[]) {
    // call Cohere Rerank and reorder candidates
  }
}
```
## Error Handling
- Catch API errors and timeouts; log and return original candidates; do not block entire request.
- Provide sensible defaults for missing or invalid API keys.
## Testing
- Unit tests for mapping results from Cohere to internal structure.
- Integration tests verifying fallback behavior and performance overhead.
