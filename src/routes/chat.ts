import type { Hono } from "hono";
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "../lib/embedding";
import { HybridRetriever } from "../lib/retriever";
import { CohereReranker } from "../lib/reranker";
import { GPTGenerator } from "../lib/generator";
import { loadEnv } from "../lib/config";

import { AxLikeOrchestrator } from "../lib/orchestrator";
export function registerChatRoutes(app: Hono) {
  app.post("/api/chat", async (c) => {
    const { question, topK = 5, rerank = false, model = "gpt-4o-mini", effort = "minimal" } = await c.req.json();
    if (!question || typeof question !== "string") return c.json({ error: "question required" }, 400);

    const env = loadEnv();
    if (env.AX_ENABLED === "true") {
      const orch = new AxLikeOrchestrator();
      const { answer } = await orch.run({ question, topK, rerank: rerank && env.RERANK_ENABLED === "true", model, effort: effort as any });
      return c.json(answer);
    } else {
      const db = createDb();
      const embedder = new OpenAIEmbedder();
      const retriever = new HybridRetriever(db, embedder);
      let results = await retriever.retrieve(question, topK);
      if (rerank && env.RERANK_ENABLED === "true" && process.env.COHERE_API_KEY) {
        const rr = new CohereReranker(process.env.COHERE_API_KEY);
        results = await rr.rerank(question, results);
      }
      const generator = new GPTGenerator();
      const answer = await generator.answer(question, results, model);
      return c.json(answer);
    }
  });
}
