import { config } from './config';
import { createLogger, printBanner } from './logger';
import { loadAllModules } from './registry';
import { assetRoutes } from './routes/assets';
import { busRoutes } from './routes/bus';
import { consoleRoutes } from './routes/console';
import { moduleRoutes } from './routes/modules';
import { overlayRoutes } from './routes/overlays';
import type { Route } from './routes/types';

const startedAt = performance.now();
const log = createLogger('core');

await loadAllModules();

const routes: Route[] = [
  ...moduleRoutes,
  ...busRoutes,
  ...overlayRoutes,
  ...assetRoutes,
  ...consoleRoutes,
];

const port = config.port;
Bun.serve({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);
    for (const route of routes) {
      if (route.method !== '*' && route.method !== req.method) continue;
      const match = url.pathname.match(route.pattern);
      if (!match) continue;
      return route.handler(req, match, { server });
    }
    return new Response('not found', { status: 404 });
  },
});

log.info(`listening on http://localhost:${port}`);
printBanner(port, startedAt);
