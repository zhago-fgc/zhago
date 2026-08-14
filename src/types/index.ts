// The module authoring contract — everything a module (built-in or, eventually,
// third-party) can rely on. Kept dependency-free on purpose: this is the shape
// that would eventually become a published @zhago/types package, the same role
// @rcv-prod-toolkit/types plays for RCVolus's own module authors. Nothing in
// here should import from core/*'s implementation files — the contract comes
// first, implementations conform to it, not the other way around.

export interface ModuleManifest {
  name: string;
  version: string;
  type: 'plugin' | 'module' | 'theme';
  entry: string;
  // Lets other modules discover this one by role without hardcoding its name —
  // e.g. Match finds every installed game module by filtering tags.includes('game')
  // instead of knowing "2xko" and "sf6" exist. Not RPC or a dependency graph,
  // just a self-declared label surfaced through /api/modules.
  tags?: string[];
  ui?: {
    cockpit?: string;
    overlay?: string[];
  };
}

// A bus subscriber callback — shared by ModuleContext.on's public signature and
// the bus's own internal listener registry (core/bus.ts), so the shape is
// defined once instead of duplicated as an inline type in one place and a
// named alias in the other.
export type BusHandler = (payload: any) => any;

export interface ModuleStorageQueryOptions {
  // Exact-match filter on top-level fields of the stored JSON, e.g.
  // { eventId: 'evo2026' } to find every tournament under one event — an
  // id-reference, not a foreign key, resolved by a filtered lookup rather
  // than a SQL JOIN. Still scoped to the calling module's own collection,
  // same as every other ModuleStorage method — this widens what a module
  // can ask of its *own* data, not what it can reach into.
  where?: Record<string, string | number>;
  limit?: number;
}

export interface ModuleStorage {
  insert(collection: string, data: any, id?: string): string;
  get(collection: string, id: string): any;
  query(collection: string, options?: ModuleStorageQueryOptions): any[];
  remove(collection: string, id: string): void;
}

export interface ModuleLog {
  info: (...a: any[]) => void;
  warn: (...a: any[]) => void;
  error: (...a: any[]) => void;
}

export interface ModuleContext {
  on: (ns: string, type: string, fn: BusHandler) => () => void;
  emit: (ns: string, type: string, payload: any) => void;
  request: (ns: string, type: string, payload: any) => Promise<any>;
  storage: ModuleStorage;
  log: ModuleLog;
}

// A module's entrypoint: init(ctx), optionally returning a dispose function
// the loader calls on hot-reload/unload to release anything ctx.on() didn't
// already cover (timers, open handles, etc).
export type ModuleInit = (ctx: ModuleContext) => void | (() => void) | Promise<void | (() => void)>;
