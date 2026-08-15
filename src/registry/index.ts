import { mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { config } from '../config';
import { loadModule } from '../loader';
import { createLogger } from '../logger';
import { zhagoPath } from '../paths';
import type { ModuleManifest } from '../types';

const log = createLogger('core');

export const BUILTIN_MODULES_DIR =
  config.modulesDir ??
  (import.meta.dir.startsWith('/$bunfs')
    ? join(dirname(process.execPath), 'modules')
    : join(import.meta.dir, '..', '..', 'modules'));

export const INSTALLED_MODULES_DIR = zhagoPath('modules');

// Shared static assets (vendored CSS, the logo) any module's cockpit can
// link to — served read-only, never scanned as modules.
export const ASSETS_DIR = import.meta.dir.startsWith('/$bunfs')
  ? join(dirname(process.execPath), 'assets')
  : join(import.meta.dir, '..', '..', 'assets');

export const modules = new Map<string, string>(); // name -> module root dir
export const manifests = new Map<string, ModuleManifest>(); // name -> manifest

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

export async function loadAllModules() {
  await loadModulesFrom(BUILTIN_MODULES_DIR);
  await loadModulesFrom(INSTALLED_MODULES_DIR);
}

// Resolves which directory an overlay's index.html should come from for a
// given module + skin choice, and the <base> href to serve alongside it.
export function resolveOverlayDir(
  moduleName: string,
  skin: string,
): { dir: string; baseHref: string } | null {
  if (skin) {
    return {
      dir: join(INSTALLED_MODULES_DIR, skin, 'overlay', moduleName),
      baseHref: `/overlays/${moduleName}/${skin}/`,
    };
  }
  const defaultDir = modules.get('default');
  if (!defaultDir) return null;
  return {
    dir: join(defaultDir, 'overlay', moduleName),
    baseHref: `/modules/default/overlay/${moduleName}/`,
  };
}
