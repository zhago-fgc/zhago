import { mkdir, mkdtemp, rm, rename, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { $ } from 'bun';
import { MODULES_DIR } from '../registry';
import type { ModuleManifest } from '../types';
import type { AddOnRegistryEntry } from './registry';

export interface AddOnInstallResult {
  name: string;
  version: string;
  installedTo: string;
  restartRequired: boolean;
}

function checksumHex(checksum: string): string {
  const [algorithm, hex] = checksum.split(':');
  if (algorithm !== 'sha256' || !hex) throw new Error('only sha256 checksums are supported');
  return hex;
}

export async function installAddOn(entry: AddOnRegistryEntry): Promise<AddOnInstallResult> {
  const expectedHash = checksumHex(entry.checksum);
  const tempDir = await mkdtemp(join(tmpdir(), 'zhago-addon-'));
  const zipPath = join(tempDir, basename(new URL(entry.zipUrl).pathname));
  const extractDir = join(tempDir, 'extract');

  try {
    const res = await fetch(entry.zipUrl);
    if (!res.ok) throw new Error(`download failed with ${res.status}`);

    const bytes = new Uint8Array(await res.arrayBuffer());
    const actualHash = new Bun.CryptoHasher('sha256').update(bytes).digest('hex');
    if (actualHash !== expectedHash) throw new Error('checksum mismatch');

    await Bun.write(zipPath, bytes);
    await mkdir(extractDir, { recursive: true });
    await $`unzip -q ${zipPath} -d ${extractDir}`;

    const rawManifest = JSON.parse(await readFile(join(extractDir, 'module.json'), 'utf8'));
    const manifest = rawManifest as ModuleManifest;
    if (manifest.name !== entry.name) {
      throw new Error(`manifest name "${manifest.name}" does not match registry name "${entry.name}"`);
    }

    rawManifest.source = {
      repo: entry.sourceRepo,
      releasePage: entry.releasePage,
      zipUrl: entry.zipUrl,
      checksum: entry.checksum,
    };
    await Bun.write(join(extractDir, 'module.json'), `${JSON.stringify(rawManifest, null, 2)}\n`);

    await mkdir(MODULES_DIR, { recursive: true });
    const installDir = join(MODULES_DIR, entry.name);
    await rm(installDir, { recursive: true, force: true });
    await rename(extractDir, installDir);

    return {
      name: manifest.name,
      version: manifest.version,
      installedTo: installDir,
      restartRequired: true,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
