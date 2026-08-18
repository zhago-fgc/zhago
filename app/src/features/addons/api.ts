import { getJson } from '../../shared/api/http';
import type { ModuleManifest } from '../../shared/types/module';

export function listInstalledAddOns(): Promise<ModuleManifest[]> {
  return getJson<ModuleManifest[]>('/api/modules');
}
