'use client';
import { motion } from 'framer-motion';
const stages = ['Reader', 'Chunker', 'Embedder', 'Retriever', 'Generator'];
export function PipelineVisualizer() {
  return (
    <div className="flex gap-2">
      {stages.map((s,i)=> (
        <motion.div key={s} className="px-3 py-1 rounded-full bg-gray-200" animate={{}}>{s}</motion.div>
      ))}
    </div>
  );
}
