import type { Ranked } from "../db/retrieval";
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "./embedding";
import { HybridRetriever } from "./retriever";
import { CohereReranker } from "./reranker";
import { GPTGenerator, type ReasoningEffort } from "./generator";

export type OrchestratorParams = {
  question: string;
  topK?: number;
  rerank?: boolean;
  model?: string;
  effort?: ReasoningEffort;
  minSources?: number;
  minAvgScore?: number;
  maxHealingIters?: number;
};

export class AxLikeOrchestrator {
  async run(params: OrchestratorParams) {
    const {
      question,
      topK = 5,
      rerank = false,
      model = "gpt-4o-mini",
      effort = "minimal",
      minSources = 2,
      minAvgScore = 0.35,
      maxHealingIters = 1,
    } = params;

    const db = createDb();
    const embedder = new OpenAIEmbedder();
    const retriever = new HybridRetriever(db, embedder);

    let results: Ranked[] = await retriever.retrieve(question, topK);

    // Quality healing loop
    let iter = 0;
    while (iter < maxHealingIters && (results.length < minSources || avg(results.map((r) => r.score)) < minAvgScore)) {
      iter++;
      const refined = refineQuery(question, results);
      results = await retriever.retrieve(refined, topK);
    }

    if (rerank && process.env.COHERE_API_KEY) {
      const rr = new CohereReranker(process.env.COHERE_API_KEY);
      results = await rr.rerank(question, results);
    }

    const generator = new GPTGenerator();
    const answer = await generator.answer(question, results, model, effort);
    return { answer, results };
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function refineQuery(question: string, results: Ranked[]): string {
  // naive term extraction: take top 3 frequent words from snippets longer than 3 chars
  const text = results.map((r) => r.snippet).join(" ");
  const words = text.toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const top = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  const refined = `${question} ${top.join(" ")}`.trim();
  return refined;
}
