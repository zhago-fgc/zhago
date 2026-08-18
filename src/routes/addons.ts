import { installAddOn } from '../addons/install';
import { addonRegistry } from '../addons/registry';
import { removeAddOn } from '../addons/remove';
import { updateAddOn } from '../addons/update';
import type { Route } from './types';

const cors = { 'Access-Control-Allow-Origin': '*' };

function findRegistryEntry(name: string | undefined) {
  return addonRegistry.find((addon) => addon.name === name);
}

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
        const entry = findRegistryEntry(body.name);
        if (!entry)
          return Response.json({ error: 'add-on not found' }, { status: 404, headers: cors });
        return Response.json(await installAddOn(entry), { headers: cors });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'install failed';
        return Response.json({ error }, { status: 400, headers: cors });
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/addons\/update$/,
    handler: async (req) => {
      try {
        const body = (await req.json()) as { name?: string };
        const entry = findRegistryEntry(body.name);
        if (!entry)
          return Response.json({ error: 'add-on not found' }, { status: 404, headers: cors });
        return Response.json(await updateAddOn(entry), { headers: cors });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'update failed';
        return Response.json({ error }, { status: 400, headers: cors });
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/addons\/remove$/,
    handler: async (req) => {
      try {
        const body = (await req.json()) as { name?: string };
        if (!body.name)
          return Response.json(
            { error: 'add-on name is required' },
            { status: 400, headers: cors },
          );
        return Response.json(await removeAddOn(body.name), { headers: cors });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'remove failed';
        return Response.json({ error }, { status: 400, headers: cors });
      }
    },
  },
];
