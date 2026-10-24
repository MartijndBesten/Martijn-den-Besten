// Minimale D1-nabootsing op node:sqlite, zodat de worker-logica met echte SQL getest kan worden.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");

class Stmt {
  constructor(private db: InstanceType<typeof DatabaseSync>, private sql: string, private params: unknown[] = []) {}
  bind(...params: unknown[]) {
    return new Stmt(this.db, this.sql, params);
  }
  private p() {
    return this.params as (string | number | null)[];
  }
  async first<T>() {
    return (this.db.prepare(this.sql).get(...this.p()) as T) ?? null;
  }
  async all<T>() {
    return { results: this.db.prepare(this.sql).all(...this.p()) as T[] };
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...this.p());
    return { meta: { changes: Number(r.changes) } };
  }
}

export function createD1() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync("migrations/0001_init.sql", "utf8"));
  return {
    raw: db,
    prepare: (sql: string) => new Stmt(db, sql),
    batch: async (stmts: Stmt[]) => Promise.all(stmts.map((s) => s.run())),
  };
}
