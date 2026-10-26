// Zet de teksten uit docs/bijbelreis-niveaus/werk/uit/batch-*.json in de app: public/bijbelreis/niveaus/{a,b,c}.js.
// Schrijft ook werk/STATUS.md (per batch: geschreven, gecontroleerd). Draai daarna altijd:
//   node scripts/niveaus-controle.mjs            (en vóór publicatie: --volledig)
// Gebruik: node scripts/niveaus/samenvoegen.mjs [--alleen-gecontroleerd] [--alleen-geldig]
//   --alleen-geldig: een batch die het controlescript niet haalt (bijv. halverwege een controle), blijft buiten de app.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { PUB, WERK } from "./br.mjs";

const alleenGecontroleerd = process.argv.includes("--alleen-gecontroleerd"), alleenGeldig = process.argv.includes("--alleen-geldig");
const geldig = (f) => { try { execFileSync(process.execPath, [join(WERK, "..", "..", "..", "scripts", "niveaus-controle.mjs"), f], { stdio: "pipe" }); return true; } catch { return false; } };
const UIT = join(WERK, "uit"), batches = JSON.parse(readFileSync(join(WERK, "batches.json"), "utf8"));
const alles = {}, rijen = [];
for (const b of batches) {
  const f = join(UIT, `batch-${b.id}.json`);
  const ok = !existsSync(f) || !alleenGeldig || geldig(f);
  const j = existsSync(f) && ok ? JSON.parse(readFileSync(f, "utf8")) : {};
  const versies = Object.values(j).flatMap((v) => ["a", "b", "c"].map((n) => v[n]).filter(Boolean));
  const gec = versies.filter((v) => v.status !== "concept").length;
  const verslag = existsSync(join(WERK, "review", `batch-${b.id}.verslag.md`));
  rijen.push(`| ${b.id} | ${b.nrs.join(", ")} | ${versies.length} van ${b.nrs.length * 3} | ${gec} | ${verslag ? "ja" : "nee"}${ok ? "" : " · haalt de controle nog niet; niet in de app"} |`);
  for (const [nr, v] of Object.entries(j)) for (const n of ["a", "b", "c"]) if (v[n] && (!alleenGecontroleerd || v[n].status !== "concept")) (alles[nr] ??= {})[n] = v[n];
}

// Compact: wat op één regel past (max. 140 tekens), staat op één regel; sleutels zonder aanhalingstekens.
const sleutel = (k) => (/^[a-z]+$/i.test(k) ? k : JSON.stringify(k));
const een = (y) => Array.isArray(y) ? `[${y.map(een).join(", ")}]` : y && typeof y === "object" ? `{ ${Object.entries(y).map(([k, v]) => `${sleutel(k)}: ${een(v)}`).join(", ")} }` : JSON.stringify(y);
function fmt(x, ind, extra = 0) {
  const kort = een(x);
  if (kort.length + ind + extra <= 140 || !x || typeof x !== "object") return kort;
  const pad = " ".repeat(ind), binnen = " ".repeat(ind + 2);
  if (Array.isArray(x)) return `[\n${x.map((v) => binnen + fmt(v, ind + 2)).join(",\n")},\n${pad}]`;
  return `{\n${Object.entries(x).map(([k, v]) => `${binnen}${sleutel(k)}: ${fmt(v, ind + 2, k.length + 2)}`).join(",\n")},\n${pad}}`;
}
const kop = {
  a: "Samen ontdekken (4–6 jaar): korte verhaalstappen om samen te lezen, een tip voor wie voorleest, vragen met twee antwoorden.",
  b: "Zelf op reis (7–10 jaar): een zelfstandig leesbare vertelling in een paar onderdelen, vragen met drie antwoorden.",
  c: "Verder ontdekken (11+): verdieping en extra vragen bij de bestaande vertelling (geschiedenissen/*.js).",
};
for (const n of ["a", "b", "c"]) {
  const nrs = Object.keys(alles).map(Number).sort((x, y) => x - y).filter((nr) => alles[nr][n]);
  const body = nrs.map((nr) => `  ${nr}: ${fmt(alles[nr][n], 2, String(nr).length + 2)},`).join("\n");
  writeFileSync(join(PUB, "bijbelreis", "niveaus", `${n}.js`), `// Reisniveau ${n}. ${kop[n]}\n// Niet met de hand bewerken: bron is docs/bijbelreis-niveaus/werk/uit/batch-*.json (node scripts/niveaus/samenvoegen.mjs).\n// Regels: docs/bijbelreis-niveaus/schrijfwijzer.md. Controle: node scripts/niveaus-controle.mjs\nBR.niveaus.voegToe("${n}", {\n${body}\n});\n`);
  console.log(`niveau ${n}: ${nrs.length} geschiedenissen`);
}
const totaal = Object.values(alles).reduce((a, v) => a + Object.keys(v).length, 0);
writeFileSync(join(WERK, "STATUS.md"), `# Status reisniveaus (gegenereerd door scripts/niveaus/samenvoegen.mjs)\n\nIn de app: ${Object.keys(alles).length} geschiedenissen, ${totaal} versies${alleenGecontroleerd ? " (alleen gecontroleerde)" : ""}. Doel: 150 × 3 = 450.\n\n| Batch | Geschiedenissen | Geschreven | Gecontroleerd | Controleverslag |\n|---|---|---|---|---|\n${rijen.join("\n")}\n`);
console.log(`${totaal} versies; status in docs/bijbelreis-niveaus/werk/STATUS.md`);
