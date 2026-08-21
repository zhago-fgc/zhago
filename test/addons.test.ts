import { describe, expect, test } from 'bun:test';
import { addonRoutes } from '../src/routes/addons';
import type { RouteContext } from '../src/routes/types';

const routeContext: RouteContext = { server: {} as Bun.Server<undefined> };

describe('add-on registry routes', () => {
  test('serves the static registry', async () => {
    const route = addonRoutes.find(
      (r) => r.method === 'GET' && r.pattern.test('/api/addons/registry'),
    )!;
    const match = '/api/addons/registry'.match(route.pattern)!;
    const res = await route.handler(
      new Request('http://localhost/api/addons/registry'),
      match,
      routeContext,
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);

    // Checks the expansion logic (catalog entry -> zipUrl/checksumUrl/
    // releasePage) is self-consistent against whatever registry.json
    // currently says, rather than pinning one entry's version — a real
    // release bump should never fail this test, a broken URL derivation
    // always should.
    for (const entry of body) {
      const tag = entry.version.startsWith('v') ? entry.version : `v${entry.version}`;
      const assetBase = new URL(entry.repo).pathname.split('/').filter(Boolean).pop();
      expect(entry.sourceRepo).toBe(entry.repo);
      expect(entry.releasePage).toBe(`${entry.repo}/releases/tag/${tag}`);
      expect(entry.zipUrl).toBe(`${entry.repo}/releases/download/${tag}/${assetBase}.zip`);
      expect(entry.checksumUrl).toBe(`${entry.repo}/releases/download/${tag}/${assetBase}.sha256`);
    }

    expect(body).toContainEqual(
      expect.objectContaining({
        name: 'kofxv',
        displayName: 'The King of Fighters XV',
      }),
    );
  });

  test('returns 400 for remove requests without a name', async () => {
    const route = addonRoutes.find(
      (r) => r.method === 'POST' && r.pattern.test('/api/addons/remove'),
    )!;
    const match = '/api/addons/remove'.match(route.pattern)!;
    const res = await route.handler(
      new Request('http://localhost/api/addons/remove', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
      match,
      routeContext,
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('add-on name is required');
  });

  test('returns 404 for unknown add-on installs', async () => {
    const route = addonRoutes.find(
      (r) => r.method === 'POST' && r.pattern.test('/api/addons/install'),
    )!;
    const match = '/api/addons/install'.match(route.pattern)!;
    const res = await route.handler(
      new Request('http://localhost/api/addons/install', {
        method: 'POST',
        body: JSON.stringify({ name: 'missing' }),
      }),
      match,
      routeContext,
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('add-on not found');
  });
});
