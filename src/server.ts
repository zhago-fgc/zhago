import { bus } from './core/bus';
import { loadModule } from './core/loader';
import { createLogger } from './core/logger';
import { zhagoPath } from './core/paths';
import type { ModuleManifest } from './types';
import { uiAssets } from '../.gen/ui-assets';
import { mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// Modules — built-in or hot-loaded later — always go through the same dynamic
// import() the loader uses, and dynamic imports can't be embedded by --compile
// (only static `import ... with { type: "file" }` can, confirmed against this
// Bun version's own behavior). So modules never live inside the binary; they
// live in a real directory next to it, same as RCVolus ships a modules/ folder
// alongside its process rather than baking plugins into the executable.
const BUILTIN_MODULES_DIR =
  process.env.ZHAGO_MODULES_DIR ??
  (import.meta.dir.startsWith('/$bunfs')
    ? join(dirname(process.execPath), 'modules') // compiled: next to the real binary on disk
    : join(import.meta.dir, '..', 'modules')); // dev: repo root, sibling of src/

// Where a future `zhago module install <url>` will drop things — same ~/.zhago
// convention the old Wails app used for its db/config/templates. Scanned with
// the exact same loadModule() as built-ins; there's no separate mechanism for
// "installed later" vs "shipped with the app."
const INSTALLED_MODULES_DIR = zhagoPath('modules');

const log = createLogger('core');

const modules = new Map<string, string>(); // name -> module root dir
const manifests = new Map<string, ModuleManifest>(); // name -> manifest, for /api/modules

async function loadModulesFrom(baseDir: string) {
  await mkdir(baseDir, { recursive: true });
  for (const name of await readdir(baseDir)) {
    const dir = join(baseDir, name);
    try {
      const manifest = await loadModule(dir);
      modules.set(manifest.name, dir);
      manifests.set(manifest.name, manifest);
      log.info(`loaded module "${manifest.name}" (${manifest.type}) from ${baseDir}`);
    } catch (err) {
      log.error(`failed to load module in ${dir}:`, err);
    }
  }
}

async function loadAllModules() {
  await loadModulesFrom(BUILTIN_MODULES_DIR);
  await loadModulesFrom(INSTALLED_MODULES_DIR);
}

await loadAllModules();

const port = Number(process.env.PORT ?? 3210);
Bun.serve({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);

    // 0. Module registry — GET /api/modules (drives the Admin Console's nav)
    if (url.pathname === '/api/modules' && req.method === 'GET') {
      return Response.json([...manifests.values()], {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 1. Generic bus write — POST /api/bus/:namespace/:type
    const writeMatch = url.pathname.match(/^\/api\/bus\/([^/]+)\/([^/]+)$/);
    if (writeMatch && req.method === 'POST') {
      const [, ns, type] = writeMatch;
      const body = req.headers.get('content-type')?.includes('application/json')
        ? await req.json()
        : {};
      bus.emit(ns, type, body);
      return new Response(null, { status: 202 });
    }

    // 2. Generic bus read — GET /api/bus/:namespace/stream (SSE)
    const streamMatch = url.pathname.match(/^\/api\/bus\/([^/]+)\/stream$/);
    if (streamMatch && req.method === 'GET') {
      const [, ns] = streamMatch;
      // Bun.serve's idle timeout (default 10s) applies even mid-stream — quiet
      // stretches between updates would otherwise get the connection killed.
      // This is the fix Bun's own docs recommend for SSE: opt this one request
      // out rather than raising the global timeout for every request.
      server.timeout(req, 0);
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (data: any) =>
            controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));

          // Snapshot first, if the module answers get-current — then live updates.
          try {
            const snapshot = await bus.request(ns, 'get-current', {}, 1500);
            send(snapshot);
          } catch {
            // No snapshot handler or it timed out — fine, live updates still work.
          }
          const off = bus.on(ns, 'update', send);
          req.signal.addEventListener('abort', off);
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // 3. Static module files — GET /modules/:name/* — frontend/ (cockpit) and
    // overlay/ are sibling folders inside the module, not one shared folder;
    // the requested path picks which one. Bare /modules/:name/ defaults to
    // the cockpit, same convention as any static host defaulting to index.html.
    const staticMatch = url.pathname.match(/^\/modules\/([^/]+)\/(.*)$/);
    if (staticMatch && req.method === 'GET') {
      const [, name, rest] = staticMatch;
      const moduleDir = modules.get(name);
      if (!moduleDir) return new Response('module not found', { status: 404 });
      const file = Bun.file(join(moduleDir, rest || 'frontend/index.html'));
      if (await file.exists()) return new Response(file);
      return new Response('not found', { status: 404 });
    }

    // 4. Embedded admin console — production only (empty map in dev; Vite serves :5173 instead)
    if (Object.keys(uiAssets).length > 0 && req.method === 'GET') {
      const assetPath = uiAssets[url.pathname] ?? uiAssets['/index.html']; // SPA fallback
      if (assetPath) return new Response(Bun.file(assetPath));
    }

    // Reached only in dev without the console running (no uiAssets, no Vite
    // proxy in front of this) — list whatever's actually installed instead of
    // a name hardcoded from whichever module existed first.
    const withCockpit = [...manifests.values()].filter((m) => m.ui?.cockpit);
    const body = withCockpit.length
      ? 'zhago: no admin console built — module cockpits:\n' +
        withCockpit.map((m) => `  /modules/${m.name}/${m.ui!.cockpit}`).join('\n')
      : 'zhago: no admin console built, and no installed modules have a cockpit';
    return new Response(body, { status: 200 });
  },
});

log.info(`listening on http://localhost:${port}`);
