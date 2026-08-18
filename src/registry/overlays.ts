import { join } from 'node:path';
import { manifests, modules } from './index';

export interface ResolvedOverlayDir {
  dir: string;
  baseHref: string;
}

export async function listOverlayPacks(moduleName: string): Promise<string[]> {
  const packs: string[] = [];
  for (const manifest of manifests.values()) {
    if (manifest.type !== 'overlay' || manifest.name === 'default') continue;

    const packDir = modules.get(manifest.name);
    if (!packDir) continue;

    const hasOverlay = await Bun.file(join(packDir, 'overlay', moduleName, 'index.html')).exists();
    if (hasOverlay) packs.push(manifest.name);
  }
  return packs;
}

export function resolveOverlayDir(moduleName: string, packName: string): ResolvedOverlayDir | null {
  if (packName) {
    const packDir = modules.get(packName);
    if (!packDir) return null;
    return {
      dir: join(packDir, 'overlay', moduleName),
      baseHref: `/overlays/${moduleName}/${packName}/`,
    };
  }

  const defaultDir = modules.get('default');
  if (!defaultDir) return null;
  return {
    dir: join(defaultDir, 'overlay', moduleName),
    baseHref: `/modules/default/overlay/${moduleName}/`,
  };
}

export function resolveOverlayPackFile(
  moduleName: string,
  packName: string,
  filePath: string,
): string | null {
  const packDir = modules.get(packName);
  if (!packDir) return null;
  return join(packDir, 'overlay', moduleName, filePath || 'index.html');
}
