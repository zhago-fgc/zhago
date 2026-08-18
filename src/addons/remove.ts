import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createLogger } from '../logger';
import { INSTALLED_MODULES_DIR, unloadInstalledModule } from '../registry';

const log = createLogger('addons');

export interface AddOnRemoveResult {
  name: string;
  removedFrom: string;
  restartRequired: boolean;
}

export async function removeAddOn(name: string): Promise<AddOnRemoveResult> {
  const installDir = join(INSTALLED_MODULES_DIR, name);
  log.info(`removing ${name} from ${installDir}`);
  unloadInstalledModule(name);
  await rm(installDir, { recursive: true, force: true });
  log.info(`removed ${name} from ${installDir}`);
  return { name, removedFrom: installDir, restartRequired: false };
}
