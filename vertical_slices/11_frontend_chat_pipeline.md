# Slice 11: Frontend Chat Pipeline & Visualizer
## Objective
Enhance the chat UI with a RAG pipeline visualizer and advanced controls (model selection, top-K slider), providing transparency into the retrieval process.
## Context
After creating the basic chat page, we now need to add features that show users how the system processes their queries. Inspired by Verba’s pipeline visualizer, this slice introduces a dynamic component that highlights each step (Reader, Chunker, Embedder, Retriever, Generator) as the backend executes them. Additional chat controls allow customizing topK, rerank flag, and graph retrieval.
## Requirements
- Functional: Implement `PipelineVisualizer` component that receives stage updates from the backend and animates active stages.
- Functional: Add controls to the chat UI: dropdowns or sliders to set topK, toggle reranker/graph retrieval, and select model; send these as parameters in the API request.
- Non-functional: Keep UI responsive and accessible; ensure animations are smooth using Framer Motion.
## Implementation Tasks
1. Visualizer Component (Complexity: 4/10)
   - Build a horizontal bar or flow diagram listing stages; animate the active stage using Framer Motion.
   - Provide descriptive labels and tooltips for each stage; update active stage based on events (via Server-Sent Events or WebSocket from backend).
2. Chat Controls (Complexity: 3/10)
   - Add UI controls (e.g. number input for topK, checkboxes for `RERANK_ENABLED`, `GRAPH_ENABLED`, dropdown for model selection).
   - Modify API call to include these parameters in the request body.
3. Backend Support (Complexity: 4/10)
   - Modify `/api/chat` endpoint to accept optional parameters (topK, flags); propagate to retrieval pipeline.
   - Send stage progress events (via SSE) to the client; update UI accordingly.
4. Testing (Complexity: 3/10)
   - Unit tests for visualizer state updates.
   - Integration tests with a mock SSE server to simulate backend progress.
## Implementation Details
```
// components/PipelineVisualizer.tsx
import { motion } from 'framer-motion';
export const PipelineVisualizer = ({ currentStage }: { currentStage: number }) => {
  const stages = ['Reader', 'Chunker', 'Embedder', 'Retriever', 'Generator'];
  return (
    <div className="flex gap-2">
      {stages.map((s, i) => (
        <motion.div key={s} className="px-3 py-1 rounded-full"
          animate={{ backgroundColor: i <= currentStage ? '#0A84FF' : '#E5E5EA', scale: i === currentStage ? 1.1 : 1 }}
        >{s}</motion.div>
      ))}
    </div>
  );
};
```
## Error Handling
- Ensure SSE connection is resilient; reconnect on drop; show fallback if no progress events.
- Validate user input for topK (must be positive integer within range).
## Testing
- Unit tests for control components; verify state updates.
- Integration tests simulating API calls with custom parameters and verifying UI updates.
