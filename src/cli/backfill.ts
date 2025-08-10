#!/usr/bin/env bun
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "../lib/embedding";
import { sql } from "drizzle-orm";

const db = createDb();
const embedder = new OpenAIEmbedder();

type Row = { id: string; content: string }
const rows = (await db.execute<Row>(sql`SELECT id, content FROM chunks WHERE embedding IS NULL LIMIT 256`)) as any as Row[];
const embeddings = await embedder.embedMany((rows as Row[]).map((r: Row) => r.content));
for (let i = 0; i < rows.length; i++) {
  await db.execute(sql`UPDATE chunks SET embedding = ${embeddings[i]} WHERE id = ${((rows as Row[])[i]).id}`);
}
console.log(`Embedded ${rows.length} chunks`);
