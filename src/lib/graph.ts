import type { Database } from "../db/repo";
import { sql } from "drizzle-orm";
import type { Ranked } from "../db/retrieval";
import type { IEmbedder } from "./embedding";
import { HybridRetriever } from "./retriever";

export interface IGraphRetriever {
  retrieveGraphContext(query: string, nodeLimit: number, hopChunkLimit: number): Promise<Ranked[]>;
}

export class GraphRetriever implements IGraphRetriever {
  constructor(private db: Database, private embedder: IEmbedder) {}
  async retrieveGraphContext(query: string, nodeLimit = 10, hopChunkLimit = 2): Promise<Ranked[]> {
    const retriever = new HybridRetriever(this.db, this.embedder);
    const base = await retriever.retrieve(query, nodeLimit);
    if (base.length === 0) return [];
    const baseIds = base.map((b) => b.chunkId);

        return base;
  }
}
