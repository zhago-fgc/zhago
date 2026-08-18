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
