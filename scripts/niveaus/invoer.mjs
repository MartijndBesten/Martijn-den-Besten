// Maakt de invoer voor schrijvers en redacteuren van de reisniveaus: per geschiedenis de gegevens, kaartstappen,
// toegestane plaatsen, de bestaande vertelling en vragen, en de Statenvertalingtekst (alleen als controlebasis).
// De invoer staat niet in git (te groot, altijd opnieuw te maken): docs/bijbelreis-niveaus/werk/invoer/.
// Gebruik: node scripts/niveaus/invoer.mjs            alle batches uit werk/batches.json
//          node scripts/niveaus/invoer.mjs 07 12      alleen die batches
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { laadBR, svTekst, WERK } from "./br.mjs";

const BR = laadBR();
const ZK = { v: "identificeerbaar", w: "waarschijnlijk", b: "betwist", o: "onbekend", r: "gebied" };
const STAP = new Map();
BR.boeken.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => STAP.set(`${b.id}:${d.id}:${i}`, s))));
const G = new Map(BR.geschiedenissen.map((g) => [g.nr, g]));
const pl = (id) => { const p = BR.plaatsen[id]; return p ? `${id} „${p.n}” (${ZK[p.c] || "waarschijnlijk"})` : `${id} (onbekend id)`; };

function verhaal(g) {
  const L = [`## Geschiedenis ${g.nr} — ${g.t}`, "", `- ref: ${g.ref}`, `- sectie: ${g.sectie} · vorm: ${g.vorm}`, `- wie: ${(g.wie || []).join(", ")}`, `- tijdNoot: ${g.tijdNoot || "—"}`, `- tijd: ${g.tijd || "—"}`, "", "### Kaartstappen (waarden voor het veld `stap`)"];
  const toeg = new Set();
  for (const k of g.stappen || []) {
    const s = STAP.get(k); if (!s) continue;
    const ids = [...new Set(s.at.concat((s.r || []).flatMap((r) => r.p.filter((x) => typeof x === "string"))))];
    ids.forEach((i) => toeg.add(i));
    L.push(`- \`${k}\` — „${s.t}” (${s.ref}); plaatsen: ${ids.map(pl).join("; ") || "geen"}`, `  tekst op de kaart: ${s.txt || ""}`);
  }
  L.push("", `### Toegestane ids voor a.plaatsen: ${[...toeg].filter((i) => BR.plaatsen[i]).join(", ") || "geen (laat plaatsen weg)"}`, "");
  L.push("### Bestaande vertelling (uitleg; dit is de hoofdtekst op niveau c)", g.uitleg || "", "", "### Betekenis", g.betekenis || "", "", "### Bestaande vragen (niet herhalen op niveau c)");
  for (const q of g.quiz || []) L.push(`- ${q.q} → ${q.a[0]} (${q.why})`);
  L.push("", "### Verwijzingen die al getoond worden (cross)");
  for (const c of g.cross || []) L.push(`- ${c[0]}: ${c[1]}`);
  if (g.ontdek) L.push("", "### Ontdek (al getoond)", JSON.stringify(g.ontdek));
  L.push("", `### Statenvertaling: ${g.ref}`, "```", svTekst(BR, g.ref), "```", "");
  return L.join("\n");
}

const batches = JSON.parse(readFileSync(join(WERK, "batches.json"), "utf8"));
const alleen = process.argv.slice(2);
mkdirSync(join(WERK, "invoer"), { recursive: true });
for (const b of batches) {
  if (alleen.length && !alleen.includes(b.id)) continue;
  writeFileSync(join(WERK, "invoer", `batch-${b.id}.md`), `# Invoer batch ${b.id}: geschiedenissen ${b.nrs.join(", ")}\n\n` + b.nrs.map((nr) => verhaal(G.get(nr))).join("\n"));
  console.log(`batch-${b.id}: ${b.nrs.join(", ")}`);
}
