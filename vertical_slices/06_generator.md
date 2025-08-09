# Slice 6 — Generator

## Goal
Build prompt and answer with citations using gpt‑5‑mini/nano via AI SDK.

## Deliverables
- `IGenerator.answer(q, ctx, model, effort)` streaming support.
- RuleGate enforces minSources/minScore; “don’t know” fallback.

## Steps
1. Prompt template with explicit citations; pass `reasoningEffort`.
2. Stream tokens to client; measure latency metrics.
3. Tests: snapshot prompt building; streaming unit test.
