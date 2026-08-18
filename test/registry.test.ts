import { describe, expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadModulesFrom } from '../src/registry';

describe('module registry loading', () => {
  test('ignores non-directory entries', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zhago-modules-'));
    try {
      await writeFile(join(root, '.DS_Store'), 'metadata');
      await expect(loadModulesFrom(root)).resolves.toBeUndefined();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
