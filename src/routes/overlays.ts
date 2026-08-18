import { join } from 'node:path';
import { bus } from '../bus';
import { listOverlayPacks, resolveOverlayDir, resolveOverlayPackFile } from '../registry/overlays';
import type { Route } from './types';

function watcherScript(moduleName: string, skin: string): string {
  const streamUrl = `/api/bus/stream?ns=${moduleName}-overlay`;
  return `<script>(function(){var initial=${JSON.stringify(skin)};var es=new EventSource(${JSON.stringify(streamUrl)});es.onmessage=function(e){var msg=JSON.parse(e.data);if((msg.data.skin||'')!==initial)location.reload();};})();</script>`;
}

export const overlayRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/api\/overlays\/([^/]+)$/,
    handler: async (_req, [, name]) =>
      Response.json(await listOverlayPacks(name), {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }),
  },
  {
    method: 'GET',
    pattern: /^\/overlays\/([^/]+)\/([^/]+)\/(.*)$/,
    handler: async (_req, [, name, pack, rest]) => {
      const filePath = resolveOverlayPackFile(name, pack, rest);
      if (!filePath) return new Response('overlay pack not found', { status: 404 });

      const file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
      return new Response('not found', { status: 404 });
    },
  },
  {
    // The stable URL a TO points OBS/xSplit/vMix at. Resolves the live pack
    // off the `<module>-overlay` bus namespace on every request, serves that
    // pack's index.html with a <base> tag and a reload-on-change watcher
    // spliced in — no cooperation required from pack authors.
    method: 'GET',
    pattern: /^\/overlay\/([^/]+)$/,
    handler: async (_req, [, name]) => {
      const state = await bus.requestOr<{ skin?: string }>(`${name}-overlay`, 'get-current', {});
      const skin = state.skin ?? '';
      const resolved = resolveOverlayDir(name, skin);
      const file = resolved && Bun.file(join(resolved.dir, 'index.html'));
      if (!file || !(await file.exists()))
        return new Response('overlay not found', { status: 404 });

      const html = await file.text();
      // The shipped `default` pack watches its own skin over the same
      // multiplexed connection it already uses for its data — injecting a
      // second watcher for it would just be a second connection for no
      // reason. Any other pack (third-party, dumb by design) still gets one
      // injected here since we can't rely on it watching for itself.
      const rewritten = html
        .replace(/<head[^>]*>/i, (tag) => `${tag}\n<base href="${resolved!.baseHref}">`)
        .replace(/<\/body>/i, skin ? `${watcherScript(name, skin)}\n</body>` : '</body>');

      return new Response(rewritten, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    },
  },
];
