# Slice 10: Next.js Frontend Integration
## Objective
Create a Next.js frontend with chat interface and integrate it with the backend via API calls to `/api/chat`.
## Context
With the backend pipeline established, we need a user-facing interface. This slice sets up a Next.js app (using the App Router) and uses Vercel’s AI SDK for streaming chat. It lays the groundwork for more advanced UI features in later slices.
## Requirements
- Functional: Bootstrap a Next.js 14 (app router) project with TypeScript, Tailwind v4, and shadcn/ui; create a chat page using AI SDK’s `useChat` and Elements components.
- Functional: Provide environment config on frontend via Zod and Effect; call backend `/api/chat` endpoint; stream responses.
- Non-functional: Ensure accessible UI; support dark mode; add basic analytics (page view).
## Implementation Tasks
1. Frontend Scaffold (Complexity: 4/10)
   - Use `create-next-app` or clone Vercel’s AI Chatbot repo; upgrade packages (Tailwind v4, Next.js 14).
   - Configure Tailwind with CSS variables and theme tokens; install shadcn/ui and generate base components (Button, Input).
2. Chat Page (Complexity: 5/10)
   - Create `/chat` page using `useChat`; map messages to `<Message>` components; show streaming indicator; style with Apple-inspired theme.
   - Use Effect on frontend for config (e.g., API endpoint, model) via custom hooks.
3. Setup API Proxy (Complexity: 3/10)
   - In Next.js `app/api/chat/route.ts`, forward POST requests to backend; handle streaming; pass through env keys.
4. Testing (Complexity: 3/10)
   - Write Jest or Playwright tests to ensure chat page renders and streams tokens.
   - Lint and type-check; ensure CI passes.
## Implementation Details
```
// app/chat/page.tsx
'use client';
import { useChat, Message, PromptInput } from '@ai-sdk/react';
export default function ChatPage() {
  const { messages, input, handleSubmit, setInput, isLoading } = useChat({ api: '/api/chat' });
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
        {isLoading && <Message role="assistant" content="…"/>}
      </div>
      <PromptInput value={input} onChange={setInput} onSubmit={handleSubmit} />
    </div>
  );
}
```
## Error Handling
- Gracefully handle network errors; show toast to user on failure.
- Validate user input; disable send button when input empty.
## Testing
- Unit tests for custom hooks and config loader.
- Playwright tests for chat interaction and streaming.
