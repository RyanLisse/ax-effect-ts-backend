import { describe, it, expect } from "vitest";
import { buildPrompt } from "./generator";

describe("buildPrompt", () => {
  it("includes citations", () => {
    const prompt = buildPrompt("Q", [ { chunkId: "1", documentId: "d", snippet: "alpha" , score: 1 } ] as any, "minimal");
    expect(prompt).toContain("[1] alpha");
  });
});
