export interface LogEntry {
  time: number;
  level: 'info' | 'warn' | 'error';
  scope: string;
  message: string;
}
