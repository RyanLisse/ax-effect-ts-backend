# Slice 8 — AX/axRAG Orchestrator (Optional)

## Goal
Typed signatures + quality‑healing loop prior to final generation.

## Deliverables
- Orchestrator O2 that can replace O1 behind a feature flag.
- Signature‑driven tool calls (retrieve, graph, rerank) with validation.

## Steps
1. Define AX signatures for {questionText} → {contextItems[], finalAnswerText}.
2. Add evaluation hook to retry retrieval with refined query.
3. Tests: mock loop convergence; ensure cap on iterations.
