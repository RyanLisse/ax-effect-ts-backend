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

import { registerIngestionRoutes } from "./routes/ingest";
registerIngestionRoutes(app);
import { registerChatRoutes } from "./routes/chat";
import { registerMetricsRoutes } from "./routes/metrics";
import { registerGraphRoutes } from "./routes/graph";
import { registerProgressRoutes } from "./routes/progress";
import { registerDocumentRoutes } from "./routes/documents";
import { registerOpenApiRoute } from "./routes/openapi";

registerChatRoutes(app);
registerMetricsRoutes(app);
registerGraphRoutes(app);
registerProgressRoutes(app);
registerDocumentRoutes(app);
registerOpenApiRoute(app);

export default app;

if (import.meta.main) {
  Bun.serve({
    port: Number(process.env.PORT ?? 3000),
    fetch: app.fetch,
  });
}
