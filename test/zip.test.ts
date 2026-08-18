import { describe, expect, test } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractZip } from '../src/addons/zip';

function storedZip(entries: Record<string, string>): Uint8Array {
  const chunks: Buffer[] = [];
  for (const [name, value] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name);
    const content = Buffer.from(value);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt32LE(0, 10);
    header.writeUInt32LE(0, 14);
    header.writeUInt32LE(content.length, 18);
    header.writeUInt32LE(content.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    header.writeUInt16LE(0, 28);
    chunks.push(header, nameBytes, content);
  }
  return Buffer.concat(chunks);
}

describe('zip extraction', () => {
  test('extracts stored zip entries without shelling out to unzip', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zhago-zip-'));
    try {
      await extractZip(storedZip({ 'addon/module.json': '{"name":"addon"}\n' }), root);
      await expect(readFile(join(root, 'addon/module.json'), 'utf8')).resolves.toBe(
        '{"name":"addon"}\n',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('rejects path traversal entries', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zhago-zip-'));
    try {
      await expect(extractZip(storedZip({ '../bad.txt': 'nope' }), root)).rejects.toThrow(
        'unsafe zip path',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
