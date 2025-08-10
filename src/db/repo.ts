import { eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { chunks, documents } from "./schema";

export type Database = ReturnType<typeof import("./client").createDb>;

export async function insertDocument(db: Database, params: { title: string; source: string }) {
  const [doc] = await db.insert(documents).values({ title: params.title, source: params.source }).returning();
  return doc;
}

export async function insertChunks(
  db: Database,
  params: { documentId: string; parts: { order: number; content: string; headings?: string | null }[] }
) {
  if (params.parts.length === 0) return [];
  const rows = params.parts.map((p) => ({
    documentId: params.documentId,
    order: p.order,
    content: p.content,
    headings: p.headings ?? null,
  }));
  const inserted = await db.insert(chunks).values(rows).returning();
  return inserted;
}

export async function getDocument(db: Database, id: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  return doc ?? null;
}
