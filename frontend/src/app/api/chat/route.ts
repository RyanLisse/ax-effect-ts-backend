import { NextRequest } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
