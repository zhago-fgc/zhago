import { describe, expect, test } from 'bun:test';
import { addonRoutes } from '../src/routes/addons';

describe('add-on registry routes', () => {
  test('serves the static registry', async () => {
    const route = addonRoutes.find(
      (r) => r.method === 'GET' && r.pattern.test('/api/addons/registry'),
    )!;
    const res = await route.handler(
      new Request('http://localhost/api/addons/registry'),
      [] as any,
      {
        server: undefined as any,
      },
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
  });

  test('returns 404 for unknown add-on installs', async () => {
    const route = addonRoutes.find(
      (r) => r.method === 'POST' && r.pattern.test('/api/addons/install'),
    )!;
    const res = await route.handler(
      new Request('http://localhost/api/addons/install', {
        method: 'POST',
        body: JSON.stringify({ name: 'missing' }),
      }),
      [] as any,
      { server: undefined as any },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('add-on not found');
  });
});
