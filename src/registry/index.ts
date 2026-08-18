import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from '../config';
import { loadModule } from '../loader';
import { createLogger } from '../logger';
import { zhagoPath } from '../paths';
import type { ModuleManifest } from '../types';

const log = createLogger('core');

export const MODULES_DIR = config.modulesDir ?? zhagoPath('modules');

// Shared static assets for module cockpits. Production serves the embedded map;
// this filesystem path is a dev override for live local assets.
export const ASSETS_DIR = config.assetsDir;

export const modules = new Map<string, string>(); // name -> module root dir
export const manifests = new Map<string, ModuleManifest>(); // name -> manifest

export async function loadModulesFrom(baseDir: string, create = false) {
  if (create) await mkdir(baseDir, { recursive: true });

  let entries;
  try {
    entries = await readdir(baseDir, { withFileTypes: true });
  } catch (err) {
    log.warn(`skipping modules directory ${baseDir}:`, err);
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(baseDir, entry.name);
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
  await loadModulesFrom(MODULES_DIR, true);
}
