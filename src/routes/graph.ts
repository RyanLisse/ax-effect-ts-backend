import type { Hono } from "hono";
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "../lib/embedding";
import { GraphRetriever } from "../lib/graph";

export function registerGraphRoutes(app: Hono) {
  app.post("/api/graph/expand", async (c) => {
    const body = await c.req.json().catch(() => ({} as any));
    const q = String(body.query ?? "");
    const nodeLimit = Number(body.nodeLimit ?? 10);
    const hopChunkLimit = Number(body.hopChunkLimit ?? 2);
    if (!q.trim()) return c.json({ error: "query required" }, 400);

    const db = createDb();
    const retriever = new GraphRetriever(db, new OpenAIEmbedder());
    const results = await retriever.retrieveGraphContext(q, nodeLimit, hopChunkLimit);
    return c.json({ results });
  });
}
