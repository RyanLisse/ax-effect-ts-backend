'use client';
import useSWR from 'swr';
const fetcher = (u:string)=>fetch(u).then(r=>r.json());
export default function ApiPreview() {
  const { data } = useSWR('/api/openapi.json', fetcher);
  const paths = Object.keys(data?.paths ?? {});
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">API Preview</h1>
      <ul className="space-y-2">
        {paths.map((p)=> <li key={p} className="border rounded p-2">{p}</li>)}
      </ul>
    </div>
  );
}
