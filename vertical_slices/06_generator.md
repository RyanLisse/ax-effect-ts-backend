# Slice 6: Generator
## Objective
Generate answers with citations from retrieved chunks using a language model, ensuring citations are included and fallback to "I don't know" when insufficient context.
## Context
After retrieving relevant chunks, we need to generate a human-readable answer. This slice implements an `IGenerator` that constructs prompts with citations and uses an LLM (via Vercel AI SDK) to produce the final answer. It also introduces a RuleGate to enforce minimum sources and scores before generation.
## Requirements
- Functional: Implement `IGenerator.answer(q, ctx, model, effort)` returning answer text and citations.
- Functional: Build prompts that include context and citation markers (e.g., [1], [2]); implement streaming support to deliver partial responses.
- Non-functional: Ensure prompts abide by token limits; handle LLM errors gracefully; support multiple models.
## Implementation Tasks
1. Prompt Template & RuleGate (Complexity: 5/10)
   - Define a template with placeholders for question, context, and citations; enforce minSources/minScore via RuleGate before calling LLM.
   - Implement fallback to "I'm not sure" when RuleGate conditions aren't met.
2. Generator Implementation (Complexity: 4/10)
   - Implement `IGenerator` using Vercel AI SDK to call OpenAI's chat models; support streaming tokens to client.
   - Include `effort` parameter to adjust reasoning depth (affects prompt).
3. Tests (Complexity: 3/10)
   - Write unit tests for prompt construction with various numbers of sources and verify citation ordering.
   - Write integration tests mocking LLM to assert streaming behavior and fallback.
## Implementation Details
```
// lib/generator.ts
export interface Answer { text: string; sources: { documentId: string; chunkId: string; snippet?: string; }[]; }
export interface IGenerator {
  answer(q: string, ctx: Ranked[], model: string, effort: ReasoningEffort): Promise<Answer>;
}
export class GPTGenerator implements IGenerator {
  async answer(q: string, ctx: Ranked[], model = "gpt-5-mini", effort: ReasoningEffort = "minimal") {
    const prompt = buildPrompt(q, ctx, effort);
    const result = await ai.chat(prompt);
    return parseAnswer(result);
  }
}
```
## Error Handling
- Validate that context is non-empty; return fallback when insufficient.
- Catch LLM API errors; retry or degrade gracefully.
- Clean up streaming on abort signals.
## Testing
- Unit tests for `buildPrompt` with different contexts and efforts.
- Integration tests verifying streaming, citation extraction, and fallback logic using a mock AI provider.
