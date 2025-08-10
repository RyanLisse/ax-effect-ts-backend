import type { Hono } from "hono";
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "../lib/embedding";
import { HybridRetriever } from "../lib/retriever";
import { CohereReranker } from "../lib/reranker";
import { GPTGenerator } from "../lib/generator";
import { loadEnv } from "../lib/config";

function sseFormat(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function registerProgressRoutes(app: Hono) {
  app.post("/api/chat-sse", async (c) => {
    const { question, topK = 5, rerank = false, model = "gpt-4o-mini" } = await c.req.json();
    if (!question || typeof question !== "string") return c.json({ error: "question required" }, 400);

    const env = loadEnv();
    const stream = new ReadableStream({
      start: async (controller) => {
        const enc = new TextEncoder();
        const send = (event: string, payload: unknown) => controller.enqueue(enc.encode(sseFormat(event, payload)));
        try {
          send("stage", { name: "embedder" });
          const embedder = new OpenAIEmbedder();
          const db = createDb();
          send("stage", { name: "retriever" });
          const retriever = new HybridRetriever(db, embedder);
          let results = await retriever.retrieve(question, topK);
          if (rerank && env.RERANK_ENABLED === "true" && process.env.COHERE_API_KEY) {
            send("stage", { name: "reranker" });
            const rr = new CohereReranker(process.env.COHERE_API_KEY);
            results = await rr.rerank(question, results);
          }
          send("stage", { name: "generator" });
          const generator = new GPTGenerator();
          const answer = await generator.answer(question, results, model);
          send("answer", answer);
          controller.close();
        } catch (err) {
          const message = (err as Error).message;
          controller.enqueue(enc.encode(sseFormat("error", { message })));
          controller.close();
        }
      },
    });
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");
    return c.body(stream);
  });
}
