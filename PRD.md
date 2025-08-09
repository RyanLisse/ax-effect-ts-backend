Modular RAG + Frontend AI Chatbot — PRD & Build Plan

Goal: Build a typed, modular RAG stack with a modern chat UI. Backend: Effect, Hono API, Drizzle ORM, hybrid retrieval, optional Graph RAG & Reranker. Frontend: Next.js 13 App Router, AI SDK Elements, Tailwind v4 with Apple-inspired aesthetics, dynamic pipeline visualiser, data explorer, and API console. All code is TypeScript, fully typed, TDD-first, with modular vertical slices.

1) TL;DR
	•	Backend flow: Reader → Chunker → Embedder → Hybrid Retriever (pgvector + pg_trgm) → (Cohere Rerank) → RuleGate → Generator (GPT‑5 mini/nano) → Answer & citations.
	•	Frontend: Real-time chat using AI SDK Elements (Conversation, Message, PromptInput); pipeline visualiser that animates each stage; data explorer to browse ingested documents and chunks; API preview for developers.
	•	Extensibility: Everything is built via ports and Effect Layers; swap embedder, retriever, LLM, reranker, or database by providing new layers or adapters. The UI is modular and decoupled from business logic.
	•	Performance: p95 ≤ 800 ms (small corpora), streaming responses, type-safe env config (Zod), Observability (structured logs, metrics, traces).
	•	Delivery: 14 vertical slices (backend and frontend), each TDD‑first, merged via worktrees, with acceptance criteria.

2) Architecture (Hexagonal: Services/Ports)

Backend architecture remains as previously defined: API routes call an Orchestrator which coordinates services (IRetriever, IGraphRetriever, IReranker, IGenerator, IRuleGate, IEmbedder) via Effect Layers. Infra includes Postgres + pgvector + pg_trgm, telemetry, and config ￼.

2.1 Frontend Architecture

The Next.js client is a separate package consuming the API. It consists of:
	•	Chat Page: Implements a chat interface using AI SDK Elements (Conversation, Message, PromptInput) and the useChat hook. Supports model selection, streaming tokens, and displays citations via a sources panel.
	•	Pipeline Visualiser: A React component that shows the RAG stages (Reader, Chunker, Embedder, Retriever, Reranker, RuleGate, Generator) as animated nodes. It subscribes to stage events from the API (via SSE or websockets) and highlights each stage as it completes.
	•	Data Explorer: Lists ingested documents and chunks, showing metadata (source, date, chunk text, embedding ID, similarity scores). Allows re‑ingestion or deletion. Could plot embeddings in 2D.
	•	API Console: A mini Postman‑like tool to test API routes. Allows building requests (method, path, body) and displays JSON responses with syntax highlighting, plus docs derived from OpenAPI.
All pages share a consistent Apple‑inspired design using Tailwind v4 design tokens, shadcn/ui for primitives, Framer Motion for animations, and Effect for global services (e.g. config, vector store client).

3) Persistence & Config

Persistence remains unchanged: Postgres with pgvector and pg_trgm indexes for semantic and trigram search; Drizzle Kit migrations. Tables: documents, chunks, optional graph tables (nodes, edges, node_chunks). Config validated by Zod; secrets loaded via env and injected into Effect Layers.

4) Retrieval Strategy
	•	Hybrid search: Weighted combination of cosine similarity and trigram match; weights configurable.
	•	Rerank: Optional Cohere Rerank v3.5; feature‑flagged; caps QPS and timeouts.
	•	Graph RAG: Expand context via 1–2 hop traversal over labelled nodes/edges; map back to chunks.

5) Orchestration
	•	Basic: Retrieve → Graph (optional) → Rerank (optional) → RuleGate → Generate.
	•	Ax/axRAG Orchestrator: (Optional) Use AX signatures to refine queries, retry retrieval, enforce quality, and deliver typed outputs.

6) Frontend Design & UX
	•	Theme: Tailwind v4 with CSS variables; neutral palette and subtle accent colour; generous spacing; smooth rounded corners; soft shadows; adapt to light/dark mode via CSS variables【44†L23-L31】.
	•	Components: Use AI SDK Elements and shadcn/ui primitives. Chat messages use streaming animation; pipeline nodes animate scale and colour via Framer Motion; data explorer uses two‑column layout; API console uses monospaced fonts and status highlights.
	•	Accessibility: All interactive elements are keyboard‑navigable; ARIA labels; high contrast; radial states for forms.

7) Observability

Backend logs structured JSON; metrics counters/histograms per stage; traces for retrieval, rerank, generation. Frontend logs API latency and error states; dev mode displays stage timings in the pipeline visualiser.

8) Non‑Functional Requirements
	•	p95 latency ≤ 800 ms; streaming tokens with < 100 ms time to first token.
	•	Accuracy ≥ 90% on evaluation set; fallback to “don’t know” when confidence below threshold.
	•	Responsive UI across devices; offline fallback displays error messages gracefully.

9) Delivery & Vertical Slices

We deliver incrementally. Each slice includes fully typed code, migrations, tests (Vitest for backend; Playwright for frontend). Use Git worktrees for parallel slices. Slices:
	1.	Slice 1: Bootstrap, Env, DB – Repo scaffolding; Zod env; Drizzle migrations for documents, chunks + pgvector + pg_trgm. Health check.
	2.	Slice 2: Ingestion & Chunking – Readers (file, path, GitHub) & chunkers (sentence, markdown); POST /ingest; store chunks.
	3.	Slice 3: Embeddings & Storage – IEmbedder port; OpenAI adapter; batch embed & store vectors.
	4.	Slice 4: Hybrid Retriever – IRetriever port; vector + trigram search; weighted merge.
	5.	Slice 5: Reranker – IReranker adapter (Cohere); feature flag.
	6.	Slice 6: Generator & RuleGate – IGenerator port using AI SDK; prompt assembly; rule gate for minimum sources/scores; streaming responses.
	7.	Slice 7: Graph RAG – Optional: graph schema & retriever; BFS 1–2 hops.
	8.	Slice 8: AX/axRAG Orchestrator – Optional: typed flows, multi‑turn retrieval, quality healing.
	9.	Slice 9: Evaluation & Observability – Eval harness (accuracy@k, groundedness); Prometheus metrics & traces.
	10.	Slice 10: Next.js Frontend Base – Upgrade to Tailwind v4; integrate AI SDK Elements for chat; basic chat UI with streaming; call /api/chat.
	11.	Slice 11: Pipeline Visualiser – Add React component that listens to backend stage events and animates progression through Reader→…→Generator. Use Framer Motion for scaling and colour transitions.
	12.	Slice 12: Data Explorer – Build a page to list documents and chunks; show metadata, similarity scores; allow re‑ingest or delete; optional 2D embedding visualisation.
	13.	Slice 13: API Preview Tool – Developer console with endpoint list, request builder, response viewer; parse OpenAPI spec if available.
	14.	Slice 14: Final Polish & Design – Apply Apple‑inspired styles across pages; implement dark mode; refine animations and accessibility; integrate model selector and citations panel in chat.

Each slice produces incremental value and is thoroughly tested. After slice 14, we freeze the API and UI for user acceptance.

10) Deployment
	1.	Local dev: docker compose up (Postgres with pgvector); pnpm dev for both backend and frontend; environment validated via Zod.
	2.	Preview: Deploy to Railway (backend) and Vercel (Next.js) using environment variables; enable tracing & metrics export.
	3.	Prod: Add read replicas; tune work_mem and HNSW parameters; enforce rate limits; use Edge functions for low latency chat.

11) Risks & Mitigations
	•	Latency spikes – Use streaming & circuit breakers; pre‑warm caches; measure stage latencies via visualiser.
	•	Data quality – Provide admin UI to inspect docs & chunks; adjust chunk sizes; enable reranker.
	•	Front‑end complexity – Modularise pages; use design tokens and consistent components; test across devices.

⸻
