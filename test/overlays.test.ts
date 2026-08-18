import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listOverlayPacks,
  resolveOverlayDir,
  resolveOverlayPackFile,
} from '../src/registry/overlays';
import { manifests, modules } from '../src/registry';

const roots: string[] = [];

async function overlayPack(name: string, targets: string[]) {
  const root = await mkdtemp(join(tmpdir(), `zhago-${name}-`));
  roots.push(root);
  modules.set(name, root);
  manifests.set(name, { name, version: '0.1.0', type: 'overlay' });

  for (const target of targets) {
    const dir = join(root, 'overlay', target);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), '<!doctype html>');
  }

  return root;
}

afterEach(async () => {
  modules.clear();
  manifests.clear();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('overlay registry helpers', () => {
  test('lists overlay packs for a target module and excludes default', async () => {
    await overlayPack('default', ['match']);
    await overlayPack('neon-grid', ['match', 'casters']);
    await overlayPack('casters-only', ['casters']);

    expect(await listOverlayPacks('match')).toEqual(['neon-grid']);
    expect(await listOverlayPacks('casters')).toEqual(['neon-grid', 'casters-only']);
  });

  test('resolves selected pack and default pack directories', async () => {
    const defaultDir = await overlayPack('default', ['match']);
    const neonDir = await overlayPack('neon-grid', ['match']);

    expect(resolveOverlayDir('match', '')).toEqual({
      dir: join(defaultDir, 'overlay', 'match'),
      baseHref: '/modules/default/overlay/match/',
    });
    expect(resolveOverlayDir('match', 'neon-grid')).toEqual({
      dir: join(neonDir, 'overlay', 'match'),
      baseHref: '/overlays/match/neon-grid/',
    });
  });

  test('resolves files inside a selected pack', async () => {
    const neonDir = await overlayPack('neon-grid', ['match']);

    expect(resolveOverlayPackFile('match', 'neon-grid', '')).toBe(
      join(neonDir, 'overlay', 'match', 'index.html'),
    );
    expect(resolveOverlayPackFile('match', 'missing', '')).toBeNull();
  });
});
