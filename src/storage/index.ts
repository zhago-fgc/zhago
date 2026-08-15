import { Database } from 'bun:sqlite';
import type { ModuleStorage, ModuleStorageQueryOptions } from '../types';
import { zhagoPath } from '../paths';

// json_extract's field path is interpolated into the SQL string itself (SQLite
// has no way to parameterize a json_extract path) — only the *value* being
// compared against goes through a bound parameter. This guards the one part
// that isn't parameterized: a field name outside this shape could otherwise
// break out of the '$.<field>' path expression.
const SAFE_FIELD = /^[a-zA-Z0-9_]+$/;

const db = new Database(zhagoPath('zhago.db'));

db.run(`
  CREATE TABLE IF NOT EXISTS records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  )
`);

// Namespace-scoped storage handed to a module via ctx.storage — the collection name
// is auto-prefixed with the module's own namespace so a module can only ever
// address its own rows without extra effort (cheap guardrail, not a hard sandbox).
export function scopedStorage(namespace: string): ModuleStorage {
  const scope = (collection: string) => `${namespace}:${collection}`;

  return {
    insert(collection: string, data: any, id = crypto.randomUUID()) {
      db.run('INSERT OR REPLACE INTO records VALUES (?, ?, ?)', [
        scope(collection),
        id,
        JSON.stringify({ id, ...data }),
      ]);
      return id;
    },
    get(collection: string, id: string) {
      const row = db
        .query('SELECT data FROM records WHERE collection = ? AND id = ?')
        .get(scope(collection), id) as { data: string } | null;
      return row ? JSON.parse(row.data) : null;
    },
    query(collection: string, options: ModuleStorageQueryOptions = {}) {
      const { where = {}, limit = 100 } = options;
      const conditions = ['collection = ?'];
      const params: (string | number)[] = [scope(collection)];

      for (const [field, value] of Object.entries(where)) {
        if (!SAFE_FIELD.test(field))
          throw new Error(`storage.query: invalid field name "${field}"`);
        conditions.push(`json_extract(data, '$.${field}') = ?`);
        params.push(value);
      }

      params.push(limit);
      const rows = db
        .query(`SELECT data FROM records WHERE ${conditions.join(' AND ')} LIMIT ?`)
        .all(...params) as { data: string }[];
      return rows.map((r) => JSON.parse(r.data));
    },
    remove(collection: string, id: string) {
      db.run('DELETE FROM records WHERE collection = ? AND id = ?', [scope(collection), id]);
    },
  };
}
