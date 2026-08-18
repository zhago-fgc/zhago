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
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}
