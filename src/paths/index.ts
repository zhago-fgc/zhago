import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from '../config';

// Resolved to absolute up front — a relative ZHAGO_DIR (e.g. `.zhago`) would
// otherwise reach the loader's dynamic `import()` unresolved, and relative
// import specifiers resolve against the *importing file's* location
// (src/loader/index.ts), not the process's cwd. That's a plain ES module
// semantic, not specific to running compiled — it breaks under `bun run`
// exactly the same way.
export const ZHAGO_DIR = resolve(config.zhagoDir);

export function zhagoPath(...segments: string[]): string {
  return join(ZHAGO_DIR, ...segments);
}

mkdirSync(ZHAGO_DIR, { recursive: true });
