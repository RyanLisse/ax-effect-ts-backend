import type { Hono } from "hono";
import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export function registerMetricsRoutes(app: Hono) {
  app.get("/metrics", async (c) => {
    c.header("Content-Type", register.contentType);
    return c.body(await register.metrics());
  });
}
