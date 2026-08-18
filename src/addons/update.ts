import { createLogger } from '../logger';
import { installAddOn, type AddOnInstallResult } from './install';
import type { AddOnRegistryEntry } from './registry';

export type AddOnUpdateResult = AddOnInstallResult;

const log = createLogger('addons');

export async function updateAddOn(entry: AddOnRegistryEntry): Promise<AddOnUpdateResult> {
  log.info(`updating ${entry.name} to ${entry.version}`);
  return installAddOn(entry);
}
