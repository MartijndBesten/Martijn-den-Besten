// Gedeeld door de niveauscripts: de gegevens van de Bijbelreis (window.BR) en de controletekst van de Statenvertaling.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PUB = join(ROOT, "public");
// Alleen voor controle; de Bijbeltekst zit niet in de app.
export const SVDIR = join(ROOT, "data", "statenvertaling");
export const WERK = join(ROOT, "docs", "bijbelreis-niveaus", "werk");

export function laadBR() {
  const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
  const scripts = [...html.matchAll(/src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s)).concat(["niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]);
  const ctx = { window: {} };
  for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
  return ctx.window.BR;
}

// De verzen van een verwijzing, als regels ‘h:v tekst’.
const boeken = {};
export function svTekst(BR, ref) {
  const q = BR.parseRef(ref); if (!q) return "";
  const uit = [];
  for (const rg of q.ranges) {
    const f = join(SVDIR, rg.slug + ".json"); if (!existsSync(f)) { uit.push(`[${rg.slug} ontbreekt]`); continue; }
    const H = (boeken[rg.slug] ??= JSON.parse(readFileSync(f, "utf8"))).hoofdstukken, n = Object.keys(H).length, c2 = rg.c2 === 999 ? n : rg.c2;
    for (let c = rg.c1; c <= c2; c++) { const vs = H[c] || []; const a = c === rg.c1 ? rg.v1 : 1, b = c === c2 && rg.v2 !== 999 ? rg.v2 : vs.length; for (let v = a; v <= b; v++) uit.push(`${c}:${v} ${vs[v - 1]}`); }
  }
  return uit.join("\n");
}
