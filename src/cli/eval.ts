#!/usr/bin/env bun
import { readFile } from "node:fs/promises";
import { AxLikeOrchestrator } from "../lib/orchestrator";

type QA = { question: string; expected?: string };

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: bun src/cli/eval.ts <dataset.json>");
    process.exit(1);
  }
  const data = JSON.parse(await readFile(file, "utf8")) as QA[];
  const orch = new AxLikeOrchestrator();
  let correct = 0;
  const start = Date.now();
  for (const item of data) {
    const { answer } = await orch.run({ question: item.question, topK: 5, rerank: false });
    if (item.expected && answer.text.toLowerCase().includes(item.expected.toLowerCase())) correct++;
  }
  const dur = Date.now() - start;
  console.log(JSON.stringify({ total: data.length, correct, accuracy: data.length ? correct / data.length : 0, ms: dur }, null, 2));
}

main();
