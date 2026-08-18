import { describe, expect, test } from 'bun:test';
import { assetRoutes } from '../src/routes/assets';

const route = assetRoutes[0]!;

describe('asset route', () => {
  test('serves embedded core assets', async () => {
    const response = await route.handler(
      new Request('http://zhago.test/assets/cockpit.css'),
      '/assets/cockpit.css'.match(route.pattern)!,
      {} as never,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('cockpit-page');
  });

  test('returns 404 for missing assets', async () => {
    const response = await route.handler(
      new Request('http://zhago.test/assets/missing.css'),
      '/assets/missing.css'.match(route.pattern)!,
      {} as never,
    );

    expect(response.status).toBe(404);
  });
});
