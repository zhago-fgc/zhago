import type { ModuleManifest } from '../types';

export interface AddOnRegistryEntry extends ModuleManifest {
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}

export const addonRegistry: AddOnRegistryEntry[] = [
  {
    name: 'default',
    displayName: 'Default Overlay Pack',
    version: '0.1.0',
    type: 'overlay',
    sourceRepo: 'https://github.com/zhago-fgc/overlay-default',
    releasePage: 'https://github.com/zhago-fgc/overlay-default/releases/tag/v0.1.0',
    zipUrl:
      'https://github.com/zhago-fgc/overlay-default/releases/download/v0.1.0/overlay-default-0.1.0.zip',
    checksum: 'sha256:8062e41ad9605f73d8bc6e9c5e4e1ee751faaabcbe6823170b6f19e07adf30c1',
    official: true,
    recommended: true,
    tags: ['overlay', 'official'],
  },
  {
    name: 'match',
    displayName: 'Match',
    version: '0.1.0',
    type: 'module',
    entry: 'index.ts',
    ui: {
      cockpit: 'frontend/index.html',
    },
    sourceRepo: 'https://github.com/zhago-fgc/module-match',
    releasePage: 'https://github.com/zhago-fgc/module-match/releases/tag/v0.1.0',
    zipUrl:
      'https://github.com/zhago-fgc/module-match/releases/download/v0.1.0/module-match-0.1.0.zip',
    checksum: 'sha256:9e2a0f3b430b0d0a4439f36b4b063e184d518cae6fb686cea826e306d754b081',
    official: true,
    recommended: true,
  },
];
