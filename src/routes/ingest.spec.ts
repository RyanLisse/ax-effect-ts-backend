import { describe, it, expect } from "vitest";
import app from "../server";

function jsonResponse(res: Response): Promise<any> {
  return res.json() as any;
}

describe("POST /api/ingest", () => {
  it("rejects invalid payload", async () => {
    const res = await app.request("/api/ingest", { method: "POST", body: "{}" });
    expect(res.status).toBe(400);
    const body = await jsonResponse(res);
    expect(body.error).toBeDefined();
  });

  it.skip("ingests simple text with sentence chunker", async () => {
    const payload = { sources: ["Hello world. Second sentence."], readerType: "simple", chunkerType: "sentence" };
    const res = await app.request("/api/ingest", { method: "POST", body: JSON.stringify(payload) });
    expect(res.status).toBe(200);
    const body = await jsonResponse(res);
    expect(body.documentsCreated).toBe(1);
    expect(body.chunksCreated).toBeGreaterThan(0);
  });
});
