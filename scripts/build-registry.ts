import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const outputPath = process.argv[2] ?? 'public/registry.json';
const registry = await readFile('registry.json', 'utf8');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, registry.endsWith('\n') ? registry : `${registry}\n`);
console.log(`wrote ${outputPath}`);
