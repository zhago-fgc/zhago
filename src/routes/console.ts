import { uiAssets } from '../../.gen/ui-assets';
import { manifests } from '../registry';
import type { Route } from './types';

export const consoleRoutes: Route[] = [
  {
    // Catch-all: embedded admin console in production, or a plaintext list
    // of module cockpits when running in dev without Vite in front.
    method: '*',
    pattern: /^.*$/,
    handler: (req) => {
      const url = new URL(req.url);
      if (req.method === 'GET' && Object.keys(uiAssets).length > 0) {
        const assetPath = uiAssets[url.pathname] ?? uiAssets['/index.html'];
        if (assetPath) return new Response(Bun.file(assetPath));
      }

      const withCockpit = [...manifests.values()].filter((m) => m.ui?.cockpit);
      const body = withCockpit.length
        ? 'zhago: no admin console built — module cockpits:\n' +
          withCockpit.map((m) => `  /modules/${m.name}/${m.ui!.cockpit}`).join('\n')
        : 'zhago: no admin console built, and no installed modules have a cockpit';
      return new Response(body, { status: 200 });
    },
  },
];
