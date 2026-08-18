import type { ModuleManifest } from '../types';

export interface AddOnRegistryEntry extends ModuleManifest {
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}

export const addonRegistry = (await Bun.file(
  new URL('./registry.json', import.meta.url),
).json()) as AddOnRegistryEntry[];
