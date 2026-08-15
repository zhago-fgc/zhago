import { join } from 'node:path';
import { ASSETS_DIR } from '../registry';
import type { Route } from './types';

export const assetRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/assets\/(.*)$/,
    handler: async (_req, [, rest]) => {
      const file = Bun.file(join(ASSETS_DIR, rest));
      if (await file.exists()) return new Response(file);
      return new Response('not found', { status: 404 });
    },
  },
];
