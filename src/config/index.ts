import { homedir } from 'node:os';
import { join } from 'node:path';

export interface Config {
  port: number;
  zhagoDir: string;
  modulesDir: string | undefined;
  logging: {
    level: 'info' | 'warn' | 'error' | undefined;
    format: 'pretty' | 'json';
    file: string | undefined;
  };
}

// Single source of truth for every env var this app reads — everything else
// imports `config` instead of touching process.env directly.
export const config: Config = {
  port: Number(process.env.ZHAGO_PORT ?? 3210),
  zhagoDir: process.env.ZHAGO_DIR ?? join(homedir(), '.zhago'),
  modulesDir: process.env.ZHAGO_MODULES_DIR,
  logging: {
    level: process.env.ZHAGO_LOG_LEVEL as Config['logging']['level'],
    format: process.env.ZHAGO_LOG_FORMAT === 'json' ? 'json' : 'pretty',
    file: process.env.ZHAGO_LOG_FILE,
  },
};
