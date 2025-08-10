#!/usr/bin/env bun
import { createDb } from "../db/client";
import { OpenAIEmbedder } from "../lib/embedding";
import { sql } from "drizzle-orm";

const db = createDb();
const embedder = new OpenAIEmbedder();

const rows = await db.execute<{ id: string; content: string }>(sql`SELECT id, content FROM chunks WHERE embedding IS NULL LIMIT 256`);
const embeddings = await embedder.embedMany(rows.map((r) => r.content));
for (let i = 0; i < rows.length; i++) {
  await db.execute(sql`UPDATE chunks SET embedding = ${embeddings[i]} WHERE id = ${rows[i].id}`);
}
console.log(`Embedded ${rows.length} chunks`);
