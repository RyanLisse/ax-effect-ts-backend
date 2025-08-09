# Slice 10 — Next.js Frontend Integration

## Goal
Attach a Next.js 15 client (App Router) with chat UI and citations panel.

## Deliverables
- `/api/chat` route bridged to Hono API.
- UI: messages, sources, filters (topK, rerank, graph). TanStack Query for server state.

## Steps
1. Use AI SDK `useChat`, stream tokens; show citations pane.
2. Add basic auth if needed for sessions; persist history.
3. Playwright smoke tests for chat; Lighthouse budget check.
