import type { Hono } from "hono";
import { and, count, desc, eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { chunks, documents } from "../db/schema";

export function registerDocumentRoutes(app: Hono) {
  app.get("/api/documents", async (c) => {
    const db = createDb();
    const docs = await db.select({ id: documents.id, title: documents.title, source: documents.source, createdAt: documents.createdAt }).from(documents).orderBy(desc(documents.createdAt));
    // counts
    const counts = await db.select({ documentId: chunks.documentId, n: count() }).from(chunks).groupBy(chunks.documentId);
    const map = new Map(counts.map((r) => [r.documentId, Number(r.n)]));
    return c.json(docs.map((d) => ({ ...d, chunkCount: map.get(d.id) ?? 0 })));
  });

  app.get("/api/documents/:id", async (c) => {
    const id = c.req.param("id");
    const db = createDb();
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) return c.json({ error: "not found" }, 404);
    const ch = await db.select().from(chunks).where(eq(chunks.documentId, id));
    return c.json({ ...doc, chunks: ch });
  });

  app.delete("/api/documents/:id", async (c) => {
    const id = c.req.param("id");
    const db = createDb();
    await db.delete(chunks).where(eq(chunks.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));
    return c.json({ ok: true });
  });

}