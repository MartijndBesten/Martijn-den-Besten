// ‘De wereld in die tijd’ (docs/bijbelreis-wereld/README.md): schrijft het register in public/bijbelreis/wereld/ingang.js
// uit de periodebestanden (public/bijbelreis/wereld/perioden/*.json): per periode de titel en bij welke geschiedenissen
// (koppelingen[].verhaal) welk jaar hoort. Zo weet de atlas zonder de gegevens te laden waar de uitnodiging moet staan.
// Gebruik: node scripts/bijbelreis-wereld.mjs            schrijft het register
//          node scripts/bijbelreis-wereld.mjs --controle  geeft exitcode 1 als het register niet klopt (tests/bijbelreis-wereld.test.ts)

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const MAP = join(ROOT, "public", "bijbelreis", "wereld", "perioden");
const INGANG = join(ROOT, "public", "bijbelreis", "wereld", "ingang.js");
const BLOK = /(\/\* REGISTER:BEGIN[^\n]*\n)[\s\S]*?(\n\s*\/\* REGISTER:EIND \*\/)/;

export function register() {
  const uit = {};
  for (const f of readdirSync(MAP).filter((x) => x.endsWith(".json")).sort()) {
    const d = JSON.parse(readFileSync(join(MAP, f), "utf8"));
    if (d.id + ".json" !== f) throw new Error(`bijbelreis-wereld: ${f} heeft id ‘${d.id}’; bestandsnaam en id moeten gelijk zijn`);
    const verhalen = {};
    for (const k of d.koppelingen || []) {
      if (k.verhaal in verhalen) throw new Error(`bijbelreis-wereld: ${f} koppelt ${k.verhaal} twee keer`);
      verhalen[k.verhaal] = k.jaar;
    }
    uit[d.id] = { titel: d.titel, verhalen };
  }
  // Eén geschiedenis hoort bij hooguit één periode (anders is niet duidelijk welke de uitnodiging opent).
  const gezien = new Map();
  for (const [id, p] of Object.entries(uit)) for (const v of Object.keys(p.verhalen)) {
    if (gezien.has(v)) throw new Error(`bijbelreis-wereld: ${v} staat bij ${gezien.get(v)} én ${id}`);
    gezien.set(v, id);
  }
  return uit;
}

export function regel(reg = register()) {
  return `  const PERIODEN = ${JSON.stringify(reg)};`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const bron = readFileSync(INGANG, "utf8");
  if (!BLOK.test(bron)) throw new Error("bijbelreis-wereld: blok REGISTER ontbreekt in ingang.js");
  const nieuw = bron.replace(BLOK, (m, a, b) => a + regel() + b);
  if (process.argv.includes("--controle")) {
    if (nieuw !== bron) { console.error("bijbelreis-wereld: het register in ingang.js is niet bijgewerkt. Draai: node scripts/bijbelreis-wereld.mjs"); process.exit(1); }
    console.log("bijbelreis-wereld: register klopt");
  } else {
    writeFileSync(INGANG, nieuw);
    console.log(`bijbelreis-wereld: register met ${Object.keys(register()).length} periode(n) geschreven`);
  }
}
