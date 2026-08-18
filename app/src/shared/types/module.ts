export interface ModuleManifest {
  name: string;
  displayName?: string;
  version: string;
  type: 'plugin' | 'module' | 'overlay';
  tags?: string[];
  ui?: {
    cockpit?: string;
    overlay?: string[];
  };
}

export interface AddOnRegistryEntry extends ModuleManifest {
  repo: string;
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum?: `sha256:${string}`;
  checksumUrl?: string;
  official?: boolean;
  recommended?: boolean;
}
