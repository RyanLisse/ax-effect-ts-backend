'use client';
import useSWR from 'swr';
const fetcher = (u:string)=>fetch(u).then(r=>r.json());
export default function DataExplorer() {
  const { data } = useSWR('/api/documents', fetcher);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Documents</h1>
      <ul className="space-y-2">
        {Array.isArray(data) ? (data as any[]).map((d:any)=> (
          <li key={d.id} className="border rounded p-2 flex items-center justify-between">
            <span>{d.title}</span>
            <span className="text-sm opacity-70">{d.chunkCount} chunks</span>
          </li>
        )) : null}
      </ul>
    </div>
  );
}
