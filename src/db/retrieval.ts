import { sql } from "drizzle-orm";
import type { Database } from "./repo";

export type Ranked = { chunkId: string; score: number; snippet: string; documentId: string };

export function normalizeScores(a: number[], b: number[]) {
  const norm = (arr: number[]) => {
    if (arr.length === 0) return arr;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    if (max === min) return arr.map(() => 0.5);
    return arr.map((x) => (x - min) / (max - min));
  };
  return { a: norm(a), b: norm(b) };
}

export async function hybridRetrieve(
  db: Database,
  params: { queryEmbedding: number[]; queryText: string; topK: number; weights?: { semantic: number; lexical: number } }
): Promise<Ranked[]> {
  const { topK } = params;
  const w = params.weights ?? { semantic: 0.7, lexical: 0.3 };

  const vectorRows = await db.execute<{ id: string; document_id: string; content: string; dist: number }>(
    sql`SELECT id, document_id, content, 1 - (embedding <#> ${params.queryEmbedding}::vector) AS dist
        FROM chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <#> ${params.queryEmbedding}::vector ASC
        LIMIT ${topK * 4}`
  );

  const lexicalRows = await db.execute<{ id: string; document_id: string; content: string; score: number }>(
    sql`SELECT id, document_id, content, similarity(content, ${params.queryText}) AS score
        FROM chunks
        WHERE content % ${params.queryText}
        ORDER BY score DESC
        LIMIT ${topK * 4}`
  );

  const allIds = new Set<string>();
  const vectorScores: Record<string, number> = {};
  const lexicalScores: Record<string, number> = {};
  for (const r of vectorRows) { allIds.add(r.id); vectorScores[r.id] = r.dist; }
  for (const r of lexicalRows) { allIds.add(r.id); lexicalScores[r.id] = r.score; }

  const ids = Array.from(allIds);
  const vecArr = ids.map((id) => vectorScores[id] ?? 0);
  const lexArr = ids.map((id) => lexicalScores[id] ?? 0);
  const { a: vecNorm, b: lexNorm } = normalizeScores(vecArr, lexArr);

  const scored = ids.map((id, i) => ({
    chunkId: id,
    documentId: (vectorRows.find((r) => r.id === id)?.document_id) ?? (lexicalRows.find((r) => r.id === id)?.document_id) ?? "",
    snippet: (vectorRows.find((r) => r.id === id)?.content) ?? (lexicalRows.find((r) => r.id === id)?.content) ?? "",
    score: w.semantic * vecNorm[i] + w.lexical * lexNorm[i],
  }));

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, topK);
}
