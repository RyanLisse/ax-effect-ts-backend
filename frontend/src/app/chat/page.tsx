'use client';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { PipelineVisualizer } from '@/components/PipelineVisualizer';

export default function ChatPage() {
  const [topK, setTopK] = useState(5);
  const [rerank, setRerank] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const { messages, input, setInput, isLoading, handleSubmit } = useChat();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <label>TopK <input type="number" value={topK} onChange={(e)=>setTopK(Number((e.target as HTMLInputElement).value))} className="border px-2 py-1 rounded w-20"/></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={rerank} onChange={(e)=>setRerank((e.target as HTMLInputElement).checked)} /> Rerank</label>
        <select value={model} onChange={(e)=>setModel((e.target as HTMLSelectElement).value)} className="border px-2 py-1 rounded">
          <option>gpt-4o-mini</option>
        </select>
      </div>
      <form onSubmit={(e)=>{e.preventDefault(); fetch('/api/chat', { method: 'POST', body: JSON.stringify({ question: input, topK, rerank, model }), headers: { 'content-type': 'application/json' } });}} className="flex gap-2">
        <input value={input} onChange={e=>setInput((e.target as HTMLInputElement).value)} className="border flex-1 px-3 py-2 rounded" placeholder="Ask a question" />
        <button className="px-4 py-2 rounded bg-black text-white" disabled={!input || isLoading}>Send</button>
      </form>
      <PipelineVisualizer />
      <div className="space-y-2">
        {messages.map((m,i)=> (
          <div key={i} className="border rounded p-2"><b>{m.role}:</b> {(m as any).content}</div>
        ))}
        {isLoading && <div className="opacity-60">…</div>}
      </div>
    </div>
  )
}
