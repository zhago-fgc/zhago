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
    expect(body).toContainEqual(
      expect.objectContaining({
        name: 'default',
        displayName: 'Default Overlay Pack',
        type: 'overlay',
        official: true,
        recommended: true,
        checksum: 'sha256:8062e41ad9605f73d8bc6e9c5e4e1ee751faaabcbe6823170b6f19e07adf30c1',
      }),
    );
    expect(body).toContainEqual(
      expect.objectContaining({
        name: 'match',
        version: '0.1.1',
        tags: expect.arrayContaining(['match', 'official']),
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
