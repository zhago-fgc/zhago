import type { ModuleContext, ModuleManifest } from '../types';
import { bus } from './bus';
import { createLogger } from './logger';
import { scopedStorage } from './storage';

const loaded = new Map<string, { dispose?: () => void; unsubs: Array<() => void> }>();

export async function loadModule(dir: string): Promise<ModuleManifest> {
  const manifestFile = Bun.file(`${dir}/module.json`);
  const manifest = (await manifestFile.json()) as ModuleManifest;

  // Unload any previous instance first — clean hot-reload, the thing RCVolus's own
  // plugin spec doesn't support (no dispose lifecycle), which is why we're adding one.
  unloadModule(manifest.name);

  const unsubs: Array<() => void> = [];
  const ctx: ModuleContext = {
    on: (ns, type, fn) => {
      const off = bus.on(ns, type, fn);
      unsubs.push(off);
      return off;
    },
    emit: bus.emit,
    request: bus.request,
    storage: scopedStorage(manifest.name),
    log: createLogger(manifest.name),
  };

  const mod = await import(`${dir}/${manifest.entry}?t=${Date.now()}`); // cache-bust for hot reload
  const dispose = await mod.default(ctx);

  loaded.set(manifest.name, { dispose, unsubs });
  return manifest;
}

export function unloadModule(name: string): void {
  const entry = loaded.get(name);
  if (!entry) return;
  for (const off of entry.unsubs) off();
  entry.dispose?.();
  loaded.delete(name);
}
