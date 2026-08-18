import { cp, mkdir, mkdtemp, rm, rename, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLogger } from '../logger';
import { INSTALLED_MODULES_DIR, reloadInstalledModule } from '../registry';
import type { ModuleManifest } from '../types';
import type { AddOnRegistryEntry } from './registry';
import { extractZip } from './zip';

const log = createLogger('addons');

export interface AddOnInstallResult {
  name: string;
  version: string;
  installedTo: string;
  restartRequired: boolean;
}

async function moveDirectory(from: string, to: string) {
  try {
    await rename(from, to);
  } catch (err) {
    if (!(err instanceof Error) || !('code' in err) || err.code !== 'EXDEV') throw err;
    await cp(from, to, { recursive: true });
    await rm(from, { recursive: true, force: true });
  }
}

function checksumHex(checksum: string): string {
  const [algorithm, hex] = checksum.split(':');
  if (algorithm !== 'sha256' || !hex) throw new Error('only sha256 checksums are supported');
  return hex;
}

export async function installAddOn(entry: AddOnRegistryEntry): Promise<AddOnInstallResult> {
  log.info(`installing ${entry.name} ${entry.version} from ${entry.zipUrl}`);
  const expectedHash = checksumHex(entry.checksum);
  const tempDir = await mkdtemp(join(tmpdir(), 'zhago-addon-'));
  const extractDir = join(tempDir, 'extract');

  try {
    const res = await fetch(entry.zipUrl);
    if (!res.ok) throw new Error(`download failed with ${res.status}`);

    const bytes = new Uint8Array(await res.arrayBuffer());
    const actualHash = new Bun.CryptoHasher('sha256').update(bytes).digest('hex');
    if (actualHash !== expectedHash) throw new Error('checksum mismatch');

    await extractZip(bytes, extractDir);

    const rawManifest = JSON.parse(await readFile(join(extractDir, 'module.json'), 'utf8'));
    const manifest = rawManifest as ModuleManifest;
    if (manifest.name !== entry.name) {
      throw new Error(
        `manifest name "${manifest.name}" does not match registry name "${entry.name}"`,
      );
    }

    rawManifest.source = {
      repo: entry.sourceRepo,
      releasePage: entry.releasePage,
      zipUrl: entry.zipUrl,
      checksum: entry.checksum,
    };
    await Bun.write(join(extractDir, 'module.json'), `${JSON.stringify(rawManifest, null, 2)}\n`);

    await mkdir(INSTALLED_MODULES_DIR, { recursive: true });
    const installDir = join(INSTALLED_MODULES_DIR, entry.name);
    await rm(installDir, { recursive: true, force: true });
    await moveDirectory(extractDir, installDir);
    const loadedManifest = await reloadInstalledModule(entry.name);
    log.info(`installed ${loadedManifest.name} ${loadedManifest.version} to ${installDir}`);

    return {
      name: loadedManifest.name,
      version: loadedManifest.version,
      installedTo: installDir,
      restartRequired: false,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
