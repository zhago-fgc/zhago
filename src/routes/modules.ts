import { join } from 'node:path';
import { manifests, modules } from '../registry';
import type { Route } from './types';

export const moduleRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/api\/modules$/,
    handler: () =>
      Response.json([...manifests.values()], { headers: { 'Access-Control-Allow-Origin': '*' } }),
  },
  {
    // frontend/ (cockpit) and overlay/ are sibling folders inside a module;
    // bare /modules/:name/ defaults to the cockpit.
    method: 'GET',
    pattern: /^\/modules\/([^/]+)\/(.*)$/,
    handler: async (_req, [, name, rest]) => {
      const moduleDir = modules.get(name);
      if (!moduleDir) return new Response('module not found', { status: 404 });
      const file = Bun.file(join(moduleDir, rest || 'frontend/index.html'));
      if (await file.exists()) return new Response(file);
      return new Response('not found', { status: 404 });
    },
  },
];
