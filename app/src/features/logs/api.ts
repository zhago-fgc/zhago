import { getJson } from '../../shared/api/http';
import type { LogEntry } from '../../shared/types/log';

export function listLogs(limit = 500): Promise<LogEntry[]> {
  return getJson<LogEntry[]>(`/api/logs?limit=${limit}`);
}
