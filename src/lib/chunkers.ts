export interface Chunker {
  chunk(text: string): string[];
}

export class SentenceChunker implements Chunker {
  chunk(text: string): string[] {
    const parts = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts;
  }
}

export class MarkdownHeadingChunker implements Chunker {
  chunk(text: string): string[] {
    const lines = text.split(/\r?\n/);
    const chunks: string[] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (/^#{1,6}\s/.test(line) && current.length > 0) {
        chunks.push(current.join("\n").trim());
        current = [];
      }
      current.push(line);
    }
    if (current.length > 0) chunks.push(current.join("\n").trim());
    return chunks.filter(Boolean);
  }
}
