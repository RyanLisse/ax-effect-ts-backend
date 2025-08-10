import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 256 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const edges = pgTable("edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  from: uuid("from").notNull().references(() => nodes.id, { onDelete: "cascade" }),
  to: uuid("to").notNull().references(() => nodes.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nodeChunks = pgTable("node_chunks", {
  nodeId: uuid("node_id").notNull().references(() => nodes.id, { onDelete: "cascade" }),
  chunkId: uuid("chunk_id").notNull(),
});
