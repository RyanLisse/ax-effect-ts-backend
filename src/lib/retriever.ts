import type { IEmbedder } from "./embedding";
import type { Database } from "../db/repo";
import { hybridRetrieve, type Ranked } from "../db/retrieval";

export interface IRetriever {
  retrieve(query: string, topK?: number): Promise<Ranked[]>;
}

export class HybridRetriever implements IRetriever {
  constructor(private db: Database, private embedder: IEmbedder, private weights = { semantic: 0.7, lexical: 0.3 }) {}
  async retrieve(query: string, topK = 5) {
    if (!query.trim()) return [];
    const [embedding] = await this.embedder.embedMany([query]);
    return hybridRetrieve(this.db, { queryEmbedding: embedding, queryText: query, topK, weights: this.weights });
  }
}
