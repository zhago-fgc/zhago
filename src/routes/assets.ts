import { join } from 'node:path';
import { coreAssets } from '../../.gen/ui-assets';
import { ASSETS_DIR } from '../registry';
import type { Route } from './types';

export const assetRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/assets\/(.*)$/,
    handler: async (_req, [, rest]) => {
      if (ASSETS_DIR) {
        const file = Bun.file(join(ASSETS_DIR, rest));
        if (await file.exists()) return new Response(file);
      }

      const assetPath = `/${rest}`;
      const embedded = coreAssets[assetPath];
      if (embedded) return new Response(Bun.file(embedded));

      return new Response('not found', { status: 404 });
    },
  },
];
