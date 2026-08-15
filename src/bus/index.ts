import type { BusHandler } from '../types';

const key = (ns: string, type: string) => `${ns}:${type}`;

const listeners = new Map<string, Set<BusHandler>>();

function on(ns: string, type: string, fn: BusHandler): () => void {
  const k = key(ns, type);
  if (!listeners.has(k)) listeners.set(k, new Set());
  listeners.get(k)!.add(fn);
  return () => listeners.get(k)?.delete(fn);
}

function emit(ns: string, type: string, payload: any): void {
  const handlers = listeners.get(key(ns, type));
  if (!handlers) return;
  // Each handler runs in isolation — one throwing subscriber must not stop delivery
  // to the others, and must not propagate back into whatever called emit().
  for (const fn of handlers) {
    try {
      fn(payload);
    } catch (err) {
      console.error(`[bus] handler for ${ns}:${type} threw:`, err);
    }
  }
}

function request(ns: string, type: string, payload: any, timeoutMs = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const replyTopic = crypto.randomUUID();
    const timer = setTimeout(() => {
      off();
      reject(new Error(`[bus] request ${ns}:${type} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    const off = on('reply', replyTopic, (data) => {
      clearTimeout(timer);
      off();
      resolve(data);
    });
    emit(ns, type, { ...payload, replyTopic });
  });
}

// request(), but resolves to `fallback` instead of rejecting on timeout —
// for callers that treat "nobody answered" as a normal case, not an error.
async function requestOr<T>(ns: string, type: string, fallback: T, timeoutMs = 1500): Promise<T> {
  try {
    return (await request(ns, type, {}, timeoutMs)) as T;
  } catch {
    return fallback;
  }
}

export const bus = { on, emit, request, requestOr };
