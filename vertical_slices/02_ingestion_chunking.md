# Slice 2: Ingestion & Chunking
## Objective
Implement ingestion endpoints and chunking logic to convert raw sources into manageable chunks with metadata.
## Context
After establishing the core project setup, the next step is to allow users to ingest various types of documents (text, PDFs, URLs, GitHub repos). This slice introduces Reader and Chunker managers to parse inputs and break them into semantically meaningful pieces. Proper chunking is critical for retrieval quality and must store provenance metadata.
## Requirements
- Functional: Expose POST /ingest API to accept a list of sources and options; implement ReaderManager to handle different input types; implement ChunkerManager with at least sentence-based and markdown-based strategies.
- Functional: Persist documents and chunks to the database with metadata (source, position, headings).
- Non-functional: Use streaming or batching to avoid memory spikes; ensure idempotent ingestion; test with large files.
## Implementation Tasks
1. Reader & Chunker Interfaces (Complexity: 4/10)
   - Define `IReader` and `IChunker` interfaces in TypeScript; implement SimpleReader for plain text and PathReader for local files.
   - Implement SentenceChunker and MarkdownHeadingChunker.
2. Ingestion API (Complexity: 5/10)
   - Create `/api/ingest` endpoint that accepts JSON body with `sources`, `readerType`, and `chunkerType`.
   - Use Effect to orchestrate reading, chunking, and saving via repositories; return counts of documents and chunks created.
3. Persistence & Metadata (Complexity: 4/10)
   - Extend Drizzle schema to capture chunk metadata (e.g., order, headings).
   - Write tests to verify chunks are saved correctly and metadata fields populated.
4. TDD Workflow (Complexity: 3/10)
   - Write unit tests for Reader and Chunker implementations.
   - Write integration tests for the ingestion endpoint using testcontainers.
## Implementation Details
```
// lib/readers.ts
export interface IReader { read(source: string): Promise<string>; }
export class SimpleReader implements IReader {
  async read(text: string) { return text; }
}
// lib/chunkers.ts
export interface IChunker { chunk(text: string): string[]; }
export class SentenceChunker implements IChunker {
  chunk(text: string) { return text.split(/\.\s+/); }
}
```
## Error Handling
- Validate input payload; return 400 on malformed requests.
- Catch and log IO errors when reading files.
- Use transactions to roll back partial ingestion on failure.
## Testing
- Unit tests for each reader and chunker ensuring expected output for sample inputs.
- Integration tests for `/api/ingest` verifying that documents and chunks are persisted and counts returned.
