import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { loadEnv } from "./lib/config";
import { createDb } from "./db/client";

const app = new Hono();
app.use(prettyJSON());

app.get("/health", async (c) => {
  try {
    const env = loadEnv();
    const db = createDb();
    await db.execute("SELECT 1");
    return c.json({ status: "ok", embedDim: env.EMBED_DIM });
  } catch (err) {
    return c.json({ status: "error", error: (err as Error).message }, 500);
  }
});

export default app;

if (import.meta.main) {
  Bun.serve({
    port: Number(process.env.PORT ?? 3000),
    fetch: app.fetch,
  });
}
