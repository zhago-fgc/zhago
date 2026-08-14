import { Database } from 'bun:sqlite'
import type { ModuleStorage } from '../types'
import { zhagoPath } from './paths'

const db = new Database(zhagoPath('zhago.db'))

db.run(`
  CREATE TABLE IF NOT EXISTS records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  )
`)

// Namespace-scoped storage handed to a module via ctx.storage — the collection name
// is auto-prefixed with the module's own namespace so a module can only ever
// address its own rows without extra effort (cheap guardrail, not a hard sandbox).
export function scopedStorage(namespace: string): ModuleStorage {
  const scope = (collection: string) => `${namespace}:${collection}`

  return {
    insert(collection: string, data: any, id = crypto.randomUUID()) {
      db.run(
        'INSERT OR REPLACE INTO records VALUES (?, ?, ?)',
        [scope(collection), id, JSON.stringify({ id, ...data })],
      )
      return id
    },
    get(collection: string, id: string) {
      const row = db
        .query('SELECT data FROM records WHERE collection = ? AND id = ?')
        .get(scope(collection), id) as { data: string } | null
      return row ? JSON.parse(row.data) : null
    },
    query(collection: string, limit = 100) {
      const rows = db
        .query('SELECT data FROM records WHERE collection = ? LIMIT ?')
        .all(scope(collection), limit) as { data: string }[]
      return rows.map((r) => JSON.parse(r.data))
    },
    remove(collection: string, id: string) {
      db.run('DELETE FROM records WHERE collection = ? AND id = ?', [scope(collection), id])
    },
  }
}
