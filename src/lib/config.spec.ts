import { describe, it, expect } from "vitest";
import { EnvSchema } from "./config";

describe("EnvSchema", () => {
  it("validates and coerces values", () => {
    const parsed = EnvSchema.parse({
      DATABASE_URL: "https://example.com",
      OPENAI_API_KEY: "x",
      EMBED_DIM: "1536",
    });
    expect(parsed.EMBED_DIM).toBe(1536);
  });
});
