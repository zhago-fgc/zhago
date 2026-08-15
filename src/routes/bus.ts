import { bus } from '../bus';
import type { Route } from './types';

const NO_SNAPSHOT = Symbol('no-snapshot');

export const busRoutes: Route[] = [
  {
    method: 'POST',
    pattern: /^\/api\/bus\/([^/]+)\/([^/]+)$/,
    handler: async (req, [, ns, type]) => {
      const body = req.headers.get('content-type')?.includes('application/json')
        ? await req.json()
        : {};
      bus.emit(ns, type, body);
      return new Response(null, { status: 202 });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/bus\/([^/]+)\/stream$/,
    handler: (req, [, ns], { server }) => {
      // Bun's default idle timeout would kill a quiet SSE connection.
      server.timeout(req, 0);
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (data: unknown) =>
            controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));

          const snapshot = await bus.requestOr(ns, 'get-current', NO_SNAPSHOT);
          if (snapshot !== NO_SNAPSHOT) send(snapshot);

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
    },
  },
  {
    // One connection, several namespaces — GET /api/bus/stream?ns=a,b,c.
    // Every push is tagged { ns, data } so a page that cares about more than
    // one namespace (e.g. an overlay's own data plus its skin-watch) doesn't
    // need a second EventSource for it. Same client-side dispatch-on-a-tag
    // shape the old Wails app's single global SSE hub used.
    method: 'GET',
    pattern: /^\/api\/bus\/stream$/,
    handler: (req, _match, { server }) => {
      const nsList = new URL(req.url).searchParams.get('ns')?.split(',').filter(Boolean) ?? [];
      server.timeout(req, 0);
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          const offs: Array<() => void> = [];
          const send = (ns: string, data: unknown) =>
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ ns, data })}\n\n`));

          for (const ns of nsList) {
            const snapshot = await bus.requestOr(ns, 'get-current', NO_SNAPSHOT);
            if (snapshot !== NO_SNAPSHOT) send(ns, snapshot);
            offs.push(bus.on(ns, 'update', (data) => send(ns, data)));
          }

          req.signal.addEventListener('abort', () => offs.forEach((off) => off()));
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    },
  },
];
