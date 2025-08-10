import type { Ranked } from "../db/retrieval";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { loadEnv } from "./config";

export type ReasoningEffort = "minimal" | "medium" | "high";
export type Answer = { text: string; sources: { documentId: string; chunkId: string; snippet?: string }[] };

export interface IGenerator {
  answer(q: string, ctx: Ranked[], model?: string, effort?: ReasoningEffort): Promise<Answer>;
}

export function buildPrompt(q: string, ctx: Ranked[], effort: ReasoningEffort = "minimal") {
  const citations = ctx.map((c, i) => `[${i + 1}] ${c.snippet}`).join("\n\n");
  const instruction = effort === "high" ? "Provide a thorough, well-structured answer." : effort === "medium" ? "Provide a concise but reasoned answer." : "Provide a brief answer.";
  return `You are a RAG assistant. Use only the provided sources. Cite using [1], [2], etc.\n\nQuestion: ${q}\n\nSources:\n${citations}\n\n${instruction}`;
}

export class GPTGenerator implements IGenerator {
  private readonly openai = createOpenAI({ apiKey: loadEnv().OPENAI_API_KEY });
  async answer(q: string, ctx: Ranked[], model = "gpt-4o-mini", effort: ReasoningEffort = "minimal"): Promise<Answer> {
    if (ctx.length === 0) return { text: "I'm not sure.", sources: [] };
    const prompt = buildPrompt(q, ctx, effort);
    const { text } = await generateText({ model: this.openai(model), prompt });
    return { text, sources: ctx.map((c) => ({ documentId: c.documentId, chunkId: c.chunkId })) };
  }
}
