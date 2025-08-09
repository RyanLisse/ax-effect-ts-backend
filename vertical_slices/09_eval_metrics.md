# Slice 9 — RAG Evaluation & Observability

## Goal
Eval harness + metrics/tracing.

## Deliverables
- Eval CLI: load Q/A pairs, run pipeline, compute accuracy@k and groundedness.
- Metrics: counters + histograms; traces per stage.

## Steps
1. CLI using Node + Effect; emit JSONL.
2. Export Prometheus metrics; integrate with Railway.
3. Tests: golden set with fixed seed; CI gate on regression.
