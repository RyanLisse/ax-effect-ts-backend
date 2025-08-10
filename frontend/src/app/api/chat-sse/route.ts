import { NextRequest } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/chat-sse', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'text/event-stream' } });
}
