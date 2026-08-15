import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config';

export const ZHAGO_DIR = config.zhagoDir;

export function zhagoPath(...segments: string[]): string {
  return join(ZHAGO_DIR, ...segments);
}

mkdirSync(ZHAGO_DIR, { recursive: true });
