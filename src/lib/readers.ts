import { readFile } from "node:fs/promises";

export interface Reader {
  read(source: string): Promise<string>;
}

export class SimpleReader implements Reader {
  async read(text: string): Promise<string> {
    return text;
  }
}

export class PathReader implements Reader {
  async read(path: string): Promise<string> {
    const data = await readFile(path, "utf8");
    return data.toString();
  }
}
