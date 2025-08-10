import type { Ranked } from "../db/retrieval";
import Cohere from "cohere-ai";

export interface IReranker { rerank(q: string, candidates: Ranked[]): Promise<Ranked[]>; }

export class CohereReranker implements IReranker {
  private client: Cohere;
  constructor(apiKey: string) {
    this.client = new Cohere({ token: apiKey });
  }
  async rerank(query: string, candidates: Ranked[]): Promise<Ranked[]> {
    if (candidates.length === 0) return candidates;
    const inputs = candidates.map((c) => c.snippet);
    const res = await this.client.rerank({ query, documents: inputs, topN: candidates.length });
    const order = res.results.map((r) => r.index);
    return order.map((idx) => candidates[idx]);
  }
}
