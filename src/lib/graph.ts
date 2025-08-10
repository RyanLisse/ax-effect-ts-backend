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

    // map chunks -> nodes
    const nodeRows = await this.db.execute<{ node_id: string }>(
      sql`SELECT DISTINCT node_id FROM node_chunks WHERE chunk_id = ANY(${sql.raw(`ARRAY[${baseIds.map((id) => `'${id}'`).join(',')}]::uuid[]`)}) )`
    );
    const nodeIds = nodeRows.map((r) => r.node_id);

    // traverse edges up to 1 hop (simple)
    const neighborRows = await this.db.execute<{ node_id: string }>(
      sql`SELECT DISTINCT e.to as node_id FROM edges e WHERE e.from = ANY(${sql.raw(`ARRAY[${nodeIds.map((id) => `'${id}'`).join(',')}]::uuid[]`)}) )`
    );
    const expandedNodeIds = Array.from(new Set([...nodeIds, ...neighborRows.map((r) => r.node_id)]));

    // gather chunks from expanded nodes
    const chunkRows = await this.db.execute<{ chunk_id: string }>(
      sql`SELECT chunk_id FROM node_chunks WHERE node_id = ANY(${sql.raw(`ARRAY[${expandedNodeIds.map((id) => `'${id}'`).join(',')}]::uuid[]`)}) ) LIMIT ${hopChunkLimit * nodeLimit}`
    );
    const extraChunkIds = chunkRows.map((r) => r.chunk_id).filter((id) => !baseIds.includes(id));

    if (extraChunkIds.length === 0) return base;

    const extraRows = await this.db.execute<{ id: string; document_id: string; content: string }>(
      sql`SELECT id, document_id, content FROM chunks WHERE id = ANY(${sql.raw(`ARRAY[${extraChunkIds.map((id) => `'${id}'`).join(',')}]::uuid[]`)}) )`
    );

    const extras: Ranked[] = extraRows.map((r) => ({ chunkId: r.id, documentId: r.document_id, snippet: r.content, score: 0.5 }));
    const merged = [...base, ...extras];
    merged.sort((a, b) => b.score - a.score);
    return merged.slice(0, nodeLimit);
  }
}
