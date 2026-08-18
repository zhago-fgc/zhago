import { installAddOn } from '../addons/install';
import { addonRegistry } from '../addons/registry';
import type { Route } from './types';

const cors = { 'Access-Control-Allow-Origin': '*' };

export const addonRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/api\/addons\/registry$/,
    handler: () => Response.json(addonRegistry, { headers: cors }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/addons\/install$/,
    handler: async (req) => {
      try {
        const body = (await req.json()) as { name?: string };
        const entry = addonRegistry.find((addon) => addon.name === body.name);
        if (!entry)
          return Response.json({ error: 'add-on not found' }, { status: 404, headers: cors });
        return Response.json(await installAddOn(entry), { headers: cors });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'install failed';
        return Response.json({ error }, { status: 400, headers: cors });
      }
    },
  },
];
