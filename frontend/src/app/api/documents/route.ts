export async function GET() {
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/documents');
  const json = await res.json();
  return Response.json(json, { status: res.status });
}
