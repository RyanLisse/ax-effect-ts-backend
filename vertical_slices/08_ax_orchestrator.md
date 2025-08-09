# Slice 8: AX/axRAG Orchestrator
## Objective
Implement an orchestrator using Ax to unify retrieval, reranking, and generation with typed signatures and a quality-healing loop.
## Context
As the system grows, orchestrating the steps manually becomes complex. This slice uses the ax framework to define a declarative RAG flow that can adaptively refine queries and call tools. It supports multi-step reasoning and optional quality-healing iterations.
## Requirements
- Functional: Define Ax signatures (e.g., `AskQuestion -> Answer`) and create an AxFlow that invokes retriever, graph retriever, reranker, and generator.
- Functional: Add a quality-healing loop that retries retrieval with refined queries if initial answer fails certain quality criteria.
- Non-functional: Use feature flag to enable this advanced orchestrator; ensure it can be swapped with the basic pipeline.
## Implementation Tasks
1. Define Ax Signatures (Complexity: 4/10)
   - Create TypeScript types for the flow input and output; define an Ax signature file.
   - Use Ax’s `axRAG` or `AxFlow` to chain tools (retrieve, rerank, generate).
2. Implement Quality-Healing (Complexity: 6/10)
   - Write logic to evaluate answer quality (e.g., missing citations, low confidence) and refine query; limit iterations to avoid loops.
   - Provide metrics for how often healing is triggered.
3. Integrate with API (Complexity: 3/10)
   - Add a feature flag `AX_ENABLED`; when true, `/api/chat` uses the Ax orchestrator instead of the basic pipeline.
   - Provide test harness for orchestrator flows.
## Implementation Details
```
// lib/orchestrator.ts
import { ax } from '@axflow/core';
const AskFlow = ax.signature({
  name: 'AskQuestion',
  input: { question: 'string' },
  output: { answer: 'string' },
});
export const askFlow = ax.flow(AskFlow).step(async ({ question }, { tools }) => {
  const results = await tools.retrieve(question);
  // ... optionally rerank, heal, generate...
  return { answer: finalAnswer };
});
```
## Error Handling
- Guard against infinite loops in healing; track iterations and abort when threshold reached.
- Catch tool errors inside Ax flow and return fallback answer.
## Testing
- Unit tests for each step of the flow (retriever, reranker, generator).
- Integration tests verifying the orchestrator produces similar or better answers than the basic pipeline on a sample dataset.
