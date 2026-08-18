import { getJson, postJson } from '../../shared/api/http';
import type { AddOnRegistryEntry, ModuleManifest } from '../../shared/types/module';

export function listInstalledAddOns(): Promise<ModuleManifest[]> {
  return getJson<ModuleManifest[]>('/api/modules');
}

export function listRegistryAddOns(): Promise<AddOnRegistryEntry[]> {
  return getJson<AddOnRegistryEntry[]>('/api/addons/registry');
}

export interface AddOnInstallResult {
  name: string;
  version: string;
  installedTo: string;
  restartRequired: boolean;
}

export function installAddOn(name: string): Promise<AddOnInstallResult> {
  return postJson<AddOnInstallResult>('/api/addons/install', { name });
}
