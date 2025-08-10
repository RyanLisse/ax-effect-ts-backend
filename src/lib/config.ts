import { z } from "zod";

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  EMBED_DIM: z.coerce.number().default(1536),
  RERANK_ENABLED: z.enum(["true", "false"]).default("false"),
  AX_ENABLED: z.enum(["true", "false"]).default("false"),
});
export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues: any[] = (parsed.error as any).issues ?? [];
    const message = issues.map((e: any) => `${Array.isArray(e.path) ? e.path.join('.') : ''}: ${e.message}`).join('; ');
    throw new Error(`Invalid environment: ${message}`);
  }
  return parsed.data as Env;
}
