import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { loadEnv } from "../lib/config";

const { Pool } = pg;

export function createDb() {
  const env = loadEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  return drizzle(pool);
}
