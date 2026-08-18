import { installAddOn, type AddOnInstallResult } from './install';
import type { AddOnRegistryEntry } from './registry';

export type AddOnUpdateResult = AddOnInstallResult;

export async function updateAddOn(entry: AddOnRegistryEntry): Promise<AddOnUpdateResult> {
  return installAddOn(entry);
}
