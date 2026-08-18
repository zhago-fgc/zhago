import registry from './registry.json' with { type: 'json' };
import type { ModuleManifest } from '../types';

export interface AddOnRegistryEntry extends ModuleManifest {
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}

export const addonRegistry = registry as AddOnRegistryEntry[];
