import { describe, expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readLogs } from '../src/routes/logs';

describe('log reader', () => {
  test('reads jsonl logs, skips corrupt lines, and applies limit', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zhago-logs-'));
    try {
      await writeFile(
        join(root, 'log.jsonl'),
        [
          JSON.stringify({ time: 2, level: 'warn', scope: 'core', message: 'second' }),
          'not json',
          JSON.stringify({ time: 1, level: 'error', scope: 'match', message: 'first' }),
        ].join('\n'),
      );
      await writeFile(
        join(root, 'log.jsonl.1'),
        JSON.stringify({ time: 3, level: 'info', scope: 'core', message: 'third' }),
      );

      expect(await readLogs(2, root, 'log.jsonl')).toEqual([
        { time: 2, level: 'warn', scope: 'core', message: 'second' },
        { time: 3, level: 'info', scope: 'core', message: 'third' },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
