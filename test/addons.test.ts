import { afterEach, describe, expect, mock, test } from 'bun:test';
import { addonRoutes } from '../src/routes/addons';
import type { RouteContext } from '../src/routes/types';

const routeContext: RouteContext = { server: {} as Bun.Server<undefined> };
const originalFetch = globalThis.fetch;

const assetNames: Record<string, string> = {
  'overlay-default': 'overlay-default-9.9.9.zip',
  'module-match': 'module-match-9.9.9.zip',
  'module-casters': 'module-casters-9.9.9.zip',
  'module-caster-directory': 'module-caster-directory-9.9.9.zip',
  'plugin-startgg': 'plugin-startgg-9.9.9.zip',
  'game-2xko': 'game-2xko-9.9.9.zip',
  'game-sf6': 'game-sf6-9.9.9.zip',
  'game-kofxv': 'game-kofxv-9.9.9.zip',
  'game-cotw': 'game-fatal-fury-cotw-9.9.9.zip',
};

function mockGitHubReleases() {
  globalThis.fetch = mock((input: RequestInfo | URL) => {
    const url = String(input);
    const repo = url.match(/repos\/[^/]+\/([^/]+)\/releases\/latest/)?.[1];
    if (!repo || !assetNames[repo]) return Promise.resolve(new Response(null, { status: 404 }));
    return Promise.resolve(
      Response.json({
        tag_name: 'v9.9.9',
        html_url: `https://github.com/zhago-fgc/${repo}/releases/tag/v9.9.9`,
        assets: [
          {
            name: assetNames[repo],
            browser_download_url: `https://github.com/zhago-fgc/${repo}/releases/download/v9.9.9/${assetNames[repo]}`,
            digest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          },
        ],
      }),
    );
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('add-on registry routes', () => {
  test('serves the remote-ready registry', async () => {
    mockGitHubReleases();
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
        checksum: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      }),
    );
    expect(body).toContainEqual(
      expect.objectContaining({
        name: 'match',
        version: '9.9.9',
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
    mockGitHubReleases();
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
