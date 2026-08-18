import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, sep } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const LOCAL_FILE_HEADER = 0x04034b50;
const STORE = 0;
const DEFLATE = 8;

function safeJoin(root: string, name: string): string {
  const normalizedName = normalize(name.replaceAll('\\', '/'));
  if (normalizedName.startsWith('..') || normalizedName.includes(`${sep}..${sep}`)) {
    throw new Error(`unsafe zip path: ${name}`);
  }
  return join(root, normalizedName);
}

export async function extractZip(bytes: Uint8Array, targetDir: string): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  const data = Buffer.from(bytes);
  let offset = 0;

  while (offset < data.length) {
    const signature = data.readUInt32LE(offset);
    if (signature !== LOCAL_FILE_HEADER) break;

    const flags = data.readUInt16LE(offset + 6);
    if (flags & 0x08) throw new Error('zip data descriptors are not supported');

    const method = data.readUInt16LE(offset + 8);
    const compressedSize = data.readUInt32LE(offset + 18);
    const fileNameLength = data.readUInt16LE(offset + 26);
    const extraLength = data.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = data.subarray(nameStart, nameStart + fileNameLength).toString('utf8');
    const contentStart = nameStart + fileNameLength + extraLength;
    const contentEnd = contentStart + compressedSize;
    const outputPath = safeJoin(targetDir, name);

    if (name.endsWith('/')) {
      await mkdir(outputPath, { recursive: true });
    } else {
      const compressed = data.subarray(contentStart, contentEnd);
      let content: Buffer;
      if (method === STORE) content = compressed;
      else if (method === DEFLATE) content = inflateRawSync(compressed);
      else throw new Error(`unsupported zip compression method: ${method}`);

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, content);
    }

    offset = contentEnd;
  }
}
