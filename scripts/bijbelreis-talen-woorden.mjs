// Staat er Nederlands op een Engelse pagina? (docs/bijbelreis-talen/README.md)
// Een woord geldt als Nederlands als het in de Nederlandse bronnen van de Bijbelreis voorkomt (public/bijbelreis.html en
// de scripts en gegevens onder public/bijbelreis/, zonder taal/) en nergens in het Engels: niet in de KJV (data/kjv/), niet
// in de Engelse bestanden (public/bijbelreis/taal/) en niet in de korte lijst gewone Engelse woorden hieronder. Zo vangt
// de controle ook losse woorden als ‘berekend’ of ‘Mozes’, en mist ze alleen woorden die in beide talen bestaan
// (‘water’, ‘is’). Gebruikt door tests/bijbelreis-talen.test.ts en e2e/bijbelreis-engels.spec.ts.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const woorden = (t) => String(t).toLowerCase().normalize("NFC").match(/\p{L}[\p{L}’'-]*\p{L}|\p{L}/gu) || [];
const alle = (dir, filter) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? alle(p, filter) : filter(p) ? [p] : []; });
// Gewone Engelse woorden die toevallig niet in de KJV of de Engelse bestanden staan, maar wel in een Nederlandse bron.
const ENGELS = "app online offline quiz pdf map maps tablet link links ok scroll zoom".split(" ");

let cache = null;
export function woordenlijsten(root = ".") {
  if (cache) return cache;
  const pub = join(root, "public");
  const nl = new Set(), en = new Set(ENGELS);
  const nlBestanden = [join(pub, "bijbelreis.html"), ...alle(join(pub, "bijbelreis"), (p) => /\.(js|html)$/.test(p) && !/[\\/]taal[\\/]/.test(p) && !/leaflet/.test(p))];
  for (const f of nlBestanden) for (const w of woorden(readFileSync(f, "utf8"))) nl.add(w);
  for (const f of alle(join(root, "data", "kjv"), (p) => p.endsWith(".json"))) for (const w of woorden(readFileSync(f, "utf8"))) en.add(w);
  // De Engelse teksten zelf: alleen de waarden (niet de sleutels van het woordenboek, de veldnamen of het commentaar,
  // die Nederlands zijn).
  const ctx = { window: { BR: { niveaus: { voegToe: (n, v) => ((ctx.window.BR.niveausTaal = ctx.window.BR.niveausTaal || []).push(v)) } } } };
  for (const f of alle(join(pub, "bijbelreis", "taal"), (p) => /\.js$/.test(p) && !/[\\/](taal|laag)\.js$/.test(p)).sort((a, b) => a.length - b.length)) {
    runInNewContext(readFileSync(f, "utf8").replace(/\bBR\./g, "window.BR."), ctx);
  }
  const waarden = (x) => (typeof x === "string" ? woorden(x).forEach((w) => en.add(w)) : Array.isArray(x) ? x.forEach(waarden) : x && typeof x === "object" ? Object.values(x).forEach(waarden) : null);
  const B = ctx.window.BR;
  // Een link naar de Nederlandse site (lang="nl") is Nederlands en telt niet mee; vervangingen die een functie zijn ook niet.
  const zonderNl = (h) => String(h).replace(/<a [^>]*lang="nl"[^>]*>[^<]*<\/a>/g, "");
  Object.values(B.taalBoek || {}).forEach((b) => { waarden(Object.values(b.woorden || {})); waarden((b.patronen || []).filter((p) => typeof p[1] === "string").map((p) => p[1])); waarden([b.kop, zonderNl(b.melding), (b.blokken || []).map((x) => zonderNl(x[1])), b.groepen, b.binnen && b.binnen.map((x) => x[1])]); });
  waarden(B.vertaling); waarden(B.niveausTaal);
  cache = { nl, en };
  return cache;
}

/** De Nederlandse woorden in een tekst (leeg als er geen zijn). */
export function nederlandseWoorden(tekst, root = ".") {
  const { nl, en } = woordenlijsten(root);
  return [...new Set(woorden(tekst).filter((w) => w.length >= 3 && nl.has(w) && !en.has(w)))];
}
