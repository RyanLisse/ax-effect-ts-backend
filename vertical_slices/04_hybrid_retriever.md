# Slice 4: Hybrid Retriever
## Objective
Implement a hybrid retrieval mechanism combining semantic (vector) similarity and lexical (trigram) matching to retrieve relevant chunks for a query.
## Context
After embedding chunks, we need to fetch the most relevant ones. A hybrid retriever improves recall by blending vector similarity with keyword overlap. This slice adds retrieval logic via SQL queries on `pgvector` and `pg_trgm` indexes and normalizes scores.
## Requirements
- Functional: Implement `IRetriever.retrieve(query: string, topK?: number): Promise<Ranked[]>` that returns scored chunks.
- Functional: Normalize and merge vector and lexical scores with configurable weights.
- Non-functional: Ensure queries are performant; measure retrieval latency; support customizing topK and weight parameters.
## Implementation Tasks
1. SQL Retrieval Logic (Complexity: 5/10)
   - Write SQL queries using Drizzle that perform vector similarity search on `embedding` and trigram match on `content`.
   - Normalize scores to [0,1] and compute a weighted sum; default weight 0.7 semantic / 0.3 lexical.
2. Retriever Adapter (Complexity: 3/10)
   - Implement `HybridRetriever` class implementing `IRetriever` interface; allow configuration of topK and weights.
   - Use Effect to inject database client.
3. Testing (Complexity: 4/10)
   - Create a sample corpus and queries; assert ordering of results.
   - Measure retrieval time and ensure under threshold (e.g., 50ms for small corpora).
## Implementation Details
```
// lib/retriever.ts
export interface Ranked { chunkId: string; score: number; snippet: string; documentId: string; }
export interface IRetriever { retrieve(q: string, topK?: number): Promise<Ranked[]>; }

export class HybridRetriever implements IRetriever {
  constructor(private db: DatabaseClient, private embedder: IEmbedder, private weights = { semantic: 0.7, lexical: 0.3 }) {}
  async retrieve(query: string, topK = 5) {
    const [embedding] = await this.embedder.embedMany([query]);
    // query vector search and trigram search...
  }
}
```
## Error Handling
- Guard against empty or null queries; return empty result.
- Handle DB errors gracefully; log and return fallback.
- Provide default weight values if config missing.
## Testing
- Unit tests for score normalization and merging functions.
- Integration tests using a seeded DB to verify retrieval quality and performance.
