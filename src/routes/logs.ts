import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { config } from '../config';
import { zhagoPath } from '../paths';
import type { Route } from './types';

interface LogEntry {
  time: number;
  level: 'info' | 'warn' | 'error';
  scope: string;
  message: string;
}

const LOG_FILE_PATH = config.logging.file ?? zhagoPath('logs', 'log.jsonl');
const LOG_DIR = dirname(LOG_FILE_PATH);
const LOG_FILE = basename(LOG_FILE_PATH);

function isLogFile(name: string, logFile = LOG_FILE): boolean {
  return name === logFile || name.startsWith(`${logFile}.`);
}

export async function readLogs(
  limit: number,
  logDir = LOG_DIR,
  logFile = LOG_FILE,
): Promise<LogEntry[]> {
  const names = await readdir(logDir).catch(() => []);
  const entries: LogEntry[] = [];

  for (const name of names.filter((entry) => isLogFile(entry, logFile)).sort()) {
    const content = await readFile(`${logDir}/${name}`, 'utf-8').catch(() => '');
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line) as LogEntry);
      } catch {
        // Ignore partial trailing writes.
      }
    }
  }

  return entries.sort((a, b) => a.time - b.time).slice(-limit);
}

export const logRoutes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/api\/logs$/,
    handler: async (req) => {
      const limit = Number(new URL(req.url).searchParams.get('limit') ?? 500);
      return Response.json(await readLogs(Math.min(Math.max(limit, 1), 2000)), {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    },
  },
];
