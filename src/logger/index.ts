import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import { createStream, type RotatingFileStream } from 'rotating-file-stream';
import { bus } from '../bus';
import { config } from '../config';
import { zhagoPath } from '../paths';
import type { ModuleLog } from '../types';

type Level = 'info' | 'warn' | 'error';

interface LogEntry {
  time: number;
  level: Level;
  scope: string;
  message: string;
}

const LEVELS: Level[] = ['info', 'warn', 'error'];

const configuredLevel = config.logging.level as Level | undefined;
const MIN_LEVEL = LEVELS.includes(configuredLevel!) ? configuredLevel! : 'info';

// "pretty" is the colored/human line used everywhere in this file; "json"
// prints the same structured entry that already goes to the file, so a
// container's stdout can be fed straight into a log aggregator instead of
// parsing the pretty-printed text.
const LOG_FORMAT = config.logging.format;

const LOG_FILE_PATH = config.logging.file ?? zhagoPath('logs', 'log.jsonl');
const LOG_DIR = dirname(LOG_FILE_PATH);
const LOG_FILE = basename(LOG_FILE_PATH);

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const COLOR: Record<Level, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

// Kept small — this is "what just happened," not a queryable archive. Full
// history lives in the rotated JSONL files on disk; a future Logs page reads
// those directly for anything older than what fits here.
const RING_SIZE = 200;
const ring: LogEntry[] = [];

// Seeds the ring buffer from whatever's already on disk, so a page opened
// right after a restart still shows what happened at boot instead of
// starting empty — the ring buffer alone can't survive a process restart,
// the file is what makes that possible.
function seedRing() {
  if (!existsSync(LOG_FILE_PATH)) return;
  const lines = readFileSync(LOG_FILE_PATH, 'utf-8').trim().split('\n').filter(Boolean);
  for (const line of lines.slice(-RING_SIZE)) {
    try {
      ring.push(JSON.parse(line));
    } catch {
      // Partial/corrupt trailing line (e.g. process killed mid-write) — skip it.
    }
  }
}
seedRing();

// Answered the same way every module answers its own `get-current` — see
// modules/match/index.ts — so the existing generic GET /api/bus/:ns/stream
// route works for `log` with no server.ts changes.
bus.on('log', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
  bus.emit('reply', replyTopic, ring);
});

let stream: RotatingFileStream | undefined;
function fileStream(): RotatingFileStream {
  if (!stream) {
    mkdirSync(LOG_DIR, { recursive: true });
    stream = createStream(LOG_FILE, { size: '5M', maxFiles: 3, path: LOG_DIR });
  }
  return stream;
}

function formatArgs(args: unknown[]): string {
  return args.map((a) => (typeof a === 'string' ? a : Bun.inspect(a))).join(' ');
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function timestamp(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function write(level: Level, scope: string, args: unknown[]) {
  // The file/ring/bus stay in sync with what's visible — a level filtered out
  // here never existed anywhere, not just hidden from the console.
  if (LEVELS.indexOf(level) < LEVELS.indexOf(MIN_LEVEL)) return;

  const time = Date.now();
  const message = formatArgs(args);
  const entry: LogEntry = { time, level, scope, message };

  const line =
    LOG_FORMAT === 'json'
      ? JSON.stringify(entry)
      : process.stdout.isTTY
        ? `${DIM}${timestamp(new Date(time))}${RESET} ${COLOR[level]}${level.toUpperCase().padEnd(5)}${RESET} ${DIM}[${scope}]${RESET} ${message}`
        : `${timestamp(new Date(time))} ${level.toUpperCase().padEnd(5)} [${scope}] ${message}`;
  (level === 'error' ? console.error : console.log)(line);

  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();
  fileStream().write(JSON.stringify(entry) + '\n');

  bus.emit('log', 'update', entry);
}

export function createLogger(scope: string): ModuleLog {
  return {
    info: (...a) => write('info', scope, a),
    warn: (...a) => write('warn', scope, a),
    error: (...a) => write('error', scope, a),
  };
}

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';

// One-time decorative banner on boot, Vite-style ("ready in Xms" / "➜ Local:") —
// deliberately not routed through write(): it's for the human at the terminal,
// not the log history, so it never touches the ring buffer, the JSONL file, or
// the bus. Plain (no color codes) when stdout isn't a TTY, same rule as write().
export function printBanner(port: number, startedAtMs: number) {
  const elapsed = Math.round(performance.now() - startedAtMs);
  if (!process.stdout.isTTY) {
    console.log(`zhago ready in ${elapsed}ms, listening on http://localhost:${port}`);
    return;
  }
  console.log(
    `\n  ${BOLD}${GREEN}⚡ zhago${RESET} ${DIM}ready in${RESET} ${BOLD}${elapsed}ms${RESET}\n\n` +
      `  ${GREEN}➜${RESET}  ${BOLD}Local:${RESET}   ${CYAN}http://localhost:${port}${RESET}\n`,
  );
}
