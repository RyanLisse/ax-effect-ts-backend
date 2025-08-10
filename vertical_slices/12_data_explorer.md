# Slice 12: Data Explorer
## Objective
Implement a data management UI that allows users to browse, inspect, and manage ingested documents and their chunks.
## Context
Transparency is key for trust. This slice introduces a Data Explorer page where users can view all source documents, inspect their chunks and metadata, and manage ingestion. It is similar to a file browser and supports re-ingestion or deletion.
## Requirements
- Functional: Create a sidebar listing ingested documents; allow selection of a document to view details (metadata, chunks, embeddings).
- Functional: Provide actions to re-ingest or delete a document; optionally visualize embeddings via a 2D plot.
- Non-functional: Ensure efficient client-side rendering for potentially large lists; maintain accessibility and responsive design.
## Implementation Tasks
1. Document Listing (Complexity: 3/10)
   - Implement a sidebar component fetching the list of documents from `/api/documents`.
   - Display names, sizes, and ingestion dates; support search/filter.
2. Detail Panel (Complexity: 4/10)
   - When a document is selected, fetch details from `/api/documents/:id`; show metadata and a list of chunks with text previews and embedding info.
   - Provide actions (buttons) for re-ingestion and deletion; call respective backend endpoints.
3. Embedding Visualization (Optional) (Complexity: 4/10)
   - Use a library like d3 or Recharts to plot embeddings in 2D space after dimension reduction (PCA).
   - Colour points by similarity or section.
4. Testing (Complexity: 3/10)
   - Unit tests for data fetching hooks and actions.
   - Integration tests for re-ingestion/deletion flows using a mocked API.
## Implementation Details
```
// app/data/page.tsx
'use client';
export default function DataExplorerPage() {
  const { data: docs } = useSWR('/api/documents');
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r p-2">
        {docs?.map(doc => (
          <button key={doc.id} onClick={() => setSelected(doc.id)}>{doc.title}</button>
        ))}
      </aside>
      <main className="flex-1 p-4">{/* detail panel here */}</main>
    </div>
  );
}
```
## Error Handling
- Handle API errors gracefully; show messages and allow retry.
- Prevent accidental deletion; confirm via modal.
## Testing
- Unit tests for data explorer components.
- E2E tests simulating user interactions (selecting, re-ingesting, deleting).
