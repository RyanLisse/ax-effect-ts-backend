import type { Hono } from "hono";
import { createDb } from "../db/client";
import { insertDocument, insertChunks } from "../db/repo";
import { PathReader, SimpleReader, type Reader } from "../lib/readers";
import { MarkdownHeadingChunker, SentenceChunker, type Chunker } from "../lib/chunkers";

export function registerIngestionRoutes(app: Hono) {
  app.post("/api/ingest", async (c) => {
    const body = await c.req.json().catch(() => null as any);
    if (!body || !Array.isArray(body.sources) || body.sources.length === 0) {
      return c.json({ error: "Invalid payload: sources[] required" }, 400);
    }

    const readerType = String(body.readerType ?? "simple");
    const chunkerType = String(body.chunkerType ?? "sentence");

    const reader: Reader = readerType === "path" ? new PathReader() : new SimpleReader();
    const chunker: Chunker = chunkerType === "markdown" ? new MarkdownHeadingChunker() : new SentenceChunker();

    const db = createDb();

    let documentsCreated = 0;
    let chunksCreated = 0;

    for (const src of body.sources as string[]) {
      const text = await reader.read(src);
      const parts = chunker.chunk(text);
      const doc = await insertDocument(db, { title: src.slice(0, 128), source: src });
      documentsCreated += 1;
      const inserted = await insertChunks(
        db,
        {
          documentId: doc.id,
          parts: parts.map((p, i) => ({ order: i, content: p })),
        }
      );
      chunksCreated += inserted.length;
    }

    return c.json({ documentsCreated, chunksCreated });
  });
}
