# Slice 3: Embeddings & Storage
## Objective
Compute vector embeddings for chunks and store them in the database for semantic retrieval.
## Context
With ingestion complete, the system must represent chunks in a vector space to enable semantic search. This slice implements an Embedder service using OpenAI's embedding API (via AI SDK) and ensures embeddings are stored in the database with proper vector indexes.
## Requirements
- Functional: Implement `IEmbedder` interface with a method `embedMany(texts: string[]): Promise<number[][]>`; implement an OpenAIEmbedder.
- Functional: Store embeddings in the `chunks.embedding` column and ensure HNSW index is present.
- Non-functional: Batch embedding calls to respect rate limits; handle API errors; ensure concurrency limits.
## Implementation Tasks
1. Embedder Interface & Adapter (Complexity: 4/10)
   - Define `IEmbedder` interface; implement `OpenAIEmbedder` that calls text-embedding-3-small via Vercel AI SDK.
   - Implement concurrency control to embed in batches of 64 texts with exponential backoff on errors.
2. Embedding Storage (Complexity: 3/10)
   - Update Drizzle migrations to ensure `embedding` column is vector type and index using HNSW or IVF.
   - Implement repository methods to update chunk embeddings.
3. Backfill Job (Complexity: 4/10)
   - Create a CLI or cron job that fetches chunks with null embeddings and embeds them in batches.
   - Use Effect to orchestrate concurrency and error handling.
4. Testing (Complexity: 3/10)
   - Mock embedding API in unit tests to produce deterministic embeddings.
   - Write integration tests ensuring embeddings are persisted and index created.
## Implementation Details
```
// lib/embedding.ts
export interface IEmbedder { embedMany(texts: string[]): Promise<number[][]>; }
export class OpenAIEmbedder implements IEmbedder {
  constructor(private client: OpenAI) {}
  async embedMany(texts: string[]) {
    const { data } = await this.client.createEmbeddings({ model: "text-embedding-3-small", input: texts });
    return data.embeddings;
  }
}
```
## Error Handling
- Wrap API calls with retries; handle rate limit errors by delaying; fallback to local embedding or skip chunk if persistent errors.
- Validate that embeddings match expected dimension; log and alert if mismatched.
## Testing
- Unit tests mocking OpenAI responses to test batch logic.
- Integration tests verifying that embeddings are saved and that backfill job processes all unembedded chunks.
