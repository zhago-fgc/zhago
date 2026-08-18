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

async function resolveChecksum(entry: AddOnRegistryEntry): Promise<`sha256:${string}`> {
  if (entry.checksum) return entry.checksum;
  if (!entry.checksumUrl) throw new Error(`checksum missing for ${entry.name}`);

  const res = await fetch(entry.checksumUrl);
  if (!res.ok) throw new Error(`checksum download failed with ${res.status}`);

  const checksum = (await res.text()).trim().split(/\s+/)[0];
  if (!checksum.match(/^sha256:[a-f0-9]{64}$/i)) throw new Error('invalid checksum file');
  return checksum as `sha256:${string}`;
}

export async function installAddOn(entry: AddOnRegistryEntry): Promise<AddOnInstallResult> {
  log.info(`installing ${entry.name} ${entry.version} from ${entry.zipUrl}`);
  const checksum = await resolveChecksum(entry);
  const expectedHash = checksumHex(checksum);
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
    if (manifest.version !== entry.version) {
      throw new Error(
        `manifest version "${manifest.version}" does not match registry version "${entry.version}"`,
      );
    }
    if (manifest.type !== entry.type) {
      throw new Error(
        `manifest type "${manifest.type}" does not match registry type "${entry.type}"`,
      );
    }

    rawManifest.source = {
      repo: entry.sourceRepo,
      releasePage: entry.releasePage,
      zipUrl: entry.zipUrl,
      checksum,
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
