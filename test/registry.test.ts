import { describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { bus } from '../src/bus';
import { loadModulesFrom, registerModule, unregisterModule } from '../src/registry';

describe('module registry loading', () => {
  test('publishes module updates when modules are registered and unregistered', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zhago-modules-'));
    const moduleDir = join(root, 'sample');
    const updates: unknown[] = [];
    const off = bus.on('modules', 'update', (payload) => updates.push(payload));

    try {
      await mkdir(moduleDir);
      await writeFile(
        join(moduleDir, 'module.json'),
        JSON.stringify({ name: 'sample', version: '1.0.0', type: 'module', entry: 'index.ts' }),
      );
      await writeFile(join(moduleDir, 'index.ts'), 'export default function start() {}\n');

      await registerModule(moduleDir);
      unregisterModule('sample');

      expect(updates).toHaveLength(2);
      expect(updates[0]).toContainEqual(expect.objectContaining({ name: 'sample' }));
      expect(updates[1]).not.toContainEqual(expect.objectContaining({ name: 'sample' }));
    } finally {
      off();
      unregisterModule('sample');
      await rm(root, { recursive: true, force: true });
    }
  });

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
