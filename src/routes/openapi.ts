import type { Hono } from "hono";

const spec = {
  openapi: "3.0.0",
  info: { title: "AX Effect TS Backend", version: "0.1.0" },
  paths: {
    "/health": { get: { summary: "Health check" } },
    "/api/ingest": { post: { summary: "Ingest sources" } },
    "/api/chat": { post: { summary: "Ask chat" } },
    "/api/chat-sse": { post: { summary: "Ask chat with SSE progress" } },
    "/api/graph/expand": { post: { summary: "Graph context expansion" } },
    "/api/documents": { get: { summary: "List documents" } },
    "/api/documents/{id}": { get: { summary: "Get document" }, delete: { summary: "Delete document" } },
    "/metrics": { get: { summary: "Prometheus metrics" } },
  },
};

export function registerOpenApiRoute(app: Hono) {
  app.get("/api/openapi.json", (c) => c.json(spec));
}
