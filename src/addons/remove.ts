import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { MODULES_DIR } from '../registry';

export interface AddOnRemoveResult {
  name: string;
  removedFrom: string;
  restartRequired: boolean;
}

export async function removeAddOn(name: string): Promise<AddOnRemoveResult> {
  const installDir = join(MODULES_DIR, name);
  await rm(installDir, { recursive: true, force: true });
  return { name, removedFrom: installDir, restartRequired: true };
}
