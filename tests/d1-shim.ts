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
  /** In een batch: SELECT's (en RETURNING) geven rijen terug, andere statements het aantal wijzigingen. */
  runOrAll() {
    const st = this.db.prepare(this.sql);
    if (/^\s*(SELECT|WITH)\b/i.test(this.sql) || /\bRETURNING\b/i.test(this.sql)) return { results: st.all(...this.p()), meta: { changes: 0 } };
    const r = st.run(...this.p());
    return { results: [], meta: { changes: Number(r.changes) } };
  }
}

export function createD1() {
  const db = new DatabaseSync(":memory:");
  // Net als D1: foreign keys aan.
  db.exec("PRAGMA foreign_keys = ON");
  for (const m of ["0001_init.sql", "0002_bezoek.sql", "0003_aanvraag.sql", "0004_strooizout.sql", "0005_strooizout_inlog.sql", "0006_strooizout_10kg.sql", "0007_strooizout_10kg_uit_zakken.sql", "0008_strooizout_prijs_zak.sql"]) db.exec(readFileSync(`migrations/${m}`, "utf8"));
  return {
    raw: db,
    prepare: (sql: string) => new Stmt(db, sql),
    // D1 voert een batch uit als één transactie: alles of niets.
    batch: async (stmts: Stmt[]) => {
      db.exec("BEGIN");
      try {
        const uit = [];
        // Synchroon, zodat gelijktijdige batches elkaar niet kunnen onderbreken (zoals bij D1).
        for (const s of stmts) uit.push(s.runOrAll());
        db.exec("COMMIT");
        return uit;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
