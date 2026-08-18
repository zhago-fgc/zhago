import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { bus } from '../bus';
import { config } from '../config';
import { loadModule, unloadModule } from '../loader';
import { createLogger } from '../logger';
import { zhagoPath } from '../paths';
import type { ModuleManifest } from '../types';

const log = createLogger('core');

export const INSTALLED_MODULES_DIR = zhagoPath('modules');
export const MODULES_DIR = config.modulesDir ?? INSTALLED_MODULES_DIR;

// Shared static assets for module cockpits. Production serves the embedded map;
// this filesystem path is a dev override for live local assets.
export const ASSETS_DIR = config.assetsDir;

export const modules = new Map<string, string>(); // name -> module root dir
export const manifests = new Map<string, ModuleManifest>(); // name -> manifest

export function listModuleManifests(): ModuleManifest[] {
  return [...manifests.values()];
}

function emitModulesChanged(): void {
  bus.emit('modules', 'update', listModuleManifests());
}

bus.on('modules', 'get-current', ({ replyTopic }) => {
  if (replyTopic) bus.emit('reply', replyTopic, listModuleManifests());
});

export async function registerModule(dir: string): Promise<ModuleManifest> {
  const manifest = await loadModule(dir);
  modules.set(manifest.name, dir);
  manifests.set(manifest.name, manifest);
  emitModulesChanged();
  return manifest;
}

export function unregisterModule(name: string): void {
  unloadModule(name);
  modules.delete(name);
  manifests.delete(name);
  emitModulesChanged();
}

export async function reloadInstalledModule(name: string): Promise<ModuleManifest> {
  const dir = join(INSTALLED_MODULES_DIR, name);
  const manifest = await registerModule(dir);
  log.info(`reloaded installed module "${manifest.name}" (${manifest.type})`);
  return manifest;
}

export function unloadInstalledModule(name: string): void {
  unregisterModule(name);
  log.info(`unloaded installed module "${name}"`);
}

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
      const manifest = await registerModule(dir);
      log.info(`loaded module "${manifest.name}" (${manifest.type}) from ${baseDir}`);
    } catch (err) {
      log.error(`failed to load module in ${dir}:`, err);
    }
  }
}

export async function loadAllModules() {
  if (MODULES_DIR !== INSTALLED_MODULES_DIR) await loadModulesFrom(MODULES_DIR);
  await loadModulesFrom(INSTALLED_MODULES_DIR, true);
}
