# Slice 2 — Ingestion & Chunking

## Goal
Readers (file, path, GitHub) → chunkers (sentence/markdown/code) with metadata.

## Deliverables
- `POST /ingest` route with payload: { sourceList[], reader, chunkerProfile }.
- Stored `documents` + `chunks` rows; ingestion metrics.

## Steps
1. Implement `ReaderManager` and `ChunkerManager` as Effect services.
2. Add sentence + markdown header chunkers; store provenance metadata.
3. Tests: fixtures for pdf/md/txt; assert counts and chunk sizes.
