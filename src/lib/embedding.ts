import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { loadEnv } from "./config";

export interface IEmbedder {
  embedMany(texts: string[]): Promise<number[][]>;
}

export class OpenAIEmbedder implements IEmbedder {
  private readonly openai = createOpenAI({ apiKey: loadEnv().OPENAI_API_KEY });
  private readonly model = "text-embedding-3-small";
  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await embedMany({ model: this.model, values: texts, 
      provider: this.openai,
    });
    return res.embeddings.map((e) => e.values);
  }
}
