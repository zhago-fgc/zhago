import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Same convention as the Wails app (internal/database/connection.go,
// internal/config/config.go, internal/bootstrap/bootstrap.go): everything
// user-owned lives under ~/.zhago, never relative to CWD or the binary's
// own location — those change depending on how the app was launched,
// ~/.zhago doesn't.
//
// ZHAGO_DIR overrides this — used so dev/test runs of this still-experimental
// core never touch the real Wails app's ~/.zhago (its config.json/zhago.db/
// templates predate this rewrite). Unset in a real install, so production
// still defaults to the same ~/.zhago the old app used.
export const ZHAGO_DIR = process.env.ZHAGO_DIR ?? join(homedir(), '.zhago');

export function zhagoPath(...segments: string[]): string {
  return join(ZHAGO_DIR, ...segments);
}

mkdirSync(ZHAGO_DIR, { recursive: true });
