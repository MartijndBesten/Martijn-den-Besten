// Controle van de reisniveaus (public/bijbelreis/niveaus/{a,b,c}.js) of van een kandidaatbestand met nieuwe versies.
// Gebruik:
//   node scripts/niveaus-controle.mjs                 alle versies in de site
//   node scripts/niveaus-controle.mjs pad/naar.json   alleen de versies in dat bestand ({ "nr": { a, b, c } })
//   node scripts/niveaus-controle.mjs --volledig      bovendien: elke geschiedenis heeft a, b en c en niets is ‘concept’
// Regels: docs/bijbelreis-niveaus/schrijfwijzer.md. Een redacteur hoeft deze vormregels niet met de hand na te lopen;
// de inhoudelijke beoordeling (trouw aan de tekst, toon, moeilijke onderwerpen) blijft mensenwerk.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s)).concat(["niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]);
const ctx = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR;

const args = process.argv.slice(2), volledig = args.includes("--volledig"), bestand = args.find((a) => !a.startsWith("--"));
const kandidaat = bestand ? JSON.parse(readFileSync(bestand, "utf8")) : BR.niveaus.verhalen;

const G = new Map(BR.geschiedenissen.map((g) => [g.nr, g]));
const STAP = new Map();
BR.boeken.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => STAP.set(`${b.id}:${d.id}:${i}`, s))));
const bible = {};
function verses(ref) {
  const q = BR.parseRef(ref);
  if (!q) return "onleesbaar";
  for (const rg of q.ranges) {
    const file = join(PUB, "bijbelreis", "bijbel", rg.slug + ".json");
    if (!existsSync(file)) continue;
    bible[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bible[rg.slug].hoofdstukken, n = Object.keys(H).length, c2 = rg.c2 === 999 ? n : rg.c2;
    if (!H[rg.c1]) return `hoofdstuk ${rg.c1} bestaat niet`;
    if (!H[c2]) return `hoofdstuk ${c2} bestaat niet`;
    if (rg.v1 > H[rg.c1].length) return `${rg.c1}:${rg.v1} bestaat niet`;
    if (rg.v2 !== 999 && rg.v2 > H[c2].length) return `${c2}:${rg.v2} bestaat niet`;
  }
  return "ok";
}
// De tekst van een verwijzing (alle verzen achter elkaar), voor de citaatcontrole.
function tekstVan(ref) {
  const q = BR.parseRef(ref); if (!q) return "";
  const uit = [];
  for (const rg of q.ranges) {
    const file = join(PUB, "bijbelreis", "bijbel", rg.slug + ".json"); if (!existsSync(file)) continue;
    bible[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bible[rg.slug].hoofdstukken, c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
    for (let c = rg.c1; c <= c2; c++) { const vs = H[c] || []; uit.push(...vs.slice((c === rg.c1 ? rg.v1 : 1) - 1, c === c2 && rg.v2 !== 999 ? rg.v2 : vs.length)); }
  }
  return uit.join(" ");
}
// Verwijzingen in een tekst: ‘Genesis 4:16’, ‘1 Johannes 3:12’, en kort ‘(4:16)’ (dan in de boeken van de geschiedenis).
const BOEK = "(?:[1-3] )?[A-Z][\\p{L}]+(?: der [A-Z][\\p{L}]+)?";
const VERS = "\\d+(?::\\d+(?:[–-]\\d+(?::\\d+)?)?)?(?:, ?\\d+(?:[–-]\\d+)?)*";
function refsIn(t, g) {
  const uit = [];
  for (const m of String(t).matchAll(new RegExp(`(${BOEK}) (${VERS})`, "gu"))) if (BR.parseRef(m[0])) uit.push(m[0]);
  const boeken = [...new Set(String(g.ref).split(/;\s*/).map((r) => (r.match(/^((?:[1-3] )?\D+?) \d/) || [])[1]).filter(Boolean))];
  for (const m of String(t).matchAll(/\((\d+:\d+(?:[–-]\d+(?::\d+)?)?(?:, ?\d+(?:[–-]\d+)?)*)\)/g)) for (const b of boeken) uit.push(`${b} ${m[1]}`);
  return uit;
}
const norm = (t) => String(t).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const SV = readdirSync(join(PUB, "bijbelreis", "bijbel")).filter((f) => f.endsWith(".json")).map((f) => Object.values(JSON.parse(readFileSync(join(PUB, "bijbelreis", "bijbel", f), "utf8")).hoofdstukken).flat().join(" ")).map(norm).join(" ");
const zinnen = (t) => (t.match(/[.!?](\s|$)/g) || []).length || 1;
const PLACEHOLDER = /\b(TODO|TBD|lorem|ipsum|xxx|PLACEHOLDER|invullen)\b|\{\{|\[\[|…\s*$|\.\.\.\s*$/i;

const fouten = [];
const fout = (nr, n, m) => fouten.push(`#${nr}${n || ""}: ${m}`);
const plaatsenVan = (g) => new Set((g.stappen || []).flatMap((k) => { const s = STAP.get(k); return s ? s.at.concat((s.r || []).flatMap((r) => r.p.filter((x) => typeof x === "string"))) : []; }));
let bereik = "", bereikHL = "";
// Zonder kleine letters te maken: de Statenvertaling onderscheidt ‘HEERE’ (de Naam) en ‘Heere’.
const normHL = (t) => String(t).normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function tekstControle(nr, n, t, waar) {
  if (typeof t !== "string" || !t.trim()) return fout(nr, n, `${waar}: leeg`);
  if (PLACEHOLDER.test(t)) fout(nr, n, `${waar}: lijkt onaf (‘${t.slice(-30)}’)`);
  if (/\s{2,}/.test(t)) fout(nr, n, `${waar}: dubbele spatie`);
  // Een citaat moet letterlijk in de Statenvertaling staan, en wel in de verzen van deze geschiedenis of in een
  // verwijzing die bij deze versie staat (refs, why of een verwijzing in de tekst zelf).
  for (const m of t.matchAll(/‘([^’]+)’/g)) for (const stuk of m[1].split(/…|\.\.\./)) {
    const s = norm(stuk); if (!s) continue;
    if (!SV.includes(s)) fout(nr, n, `${waar}: citaat niet letterlijk in de Statenvertaling: ‘${stuk}’`);
    else if (!bereik.includes(s)) fout(nr, n, `${waar}: citaat ‘${stuk}’ staat niet in de verzen van deze geschiedenis of in een genoemde verwijzing`);
    else { const h = normHL(stuk), varianten = [h, h[0].toLowerCase() + h.slice(1), h[0].toUpperCase() + h.slice(1)]; if (!varianten.some((x) => bereikHL.includes(x))) fout(nr, n, `${waar}: citaat ‘${stuk}’ wijkt in hoofdletters af van de Statenvertaling (bijvoorbeeld HEERE/Heere)`); }
  }
  if ((t.match(/‘/g) || []).length !== (t.match(/’(?!\p{L})/gu) || []).length) fout(nr, n, `${waar}: aanhalingstekens ‘ ’ niet in paren`);
}
function vragen(nr, n, qs, aantal, min, max) {
  if (!Array.isArray(qs) || qs.length < min || qs.length > max) return fout(nr, n, `aantal vragen ${qs ? qs.length : 0}, verwacht ${min}–${max}`);
  const gezien = new Set();
  for (const q of qs) {
    if (gezien.has(q.q)) fout(nr, n, `dubbele vraag ‘${q.q}’`); gezien.add(q.q);
    tekstControle(nr, n, q.q, "vraag");
    if (!Array.isArray(q.a) || q.a.length !== aantal) fout(nr, n, `‘${q.q}’: ${aantal} antwoorden verwacht`);
    else { if (new Set(q.a.map(norm)).size !== q.a.length) fout(nr, n, `‘${q.q}’: antwoorden niet uniek`); q.a.forEach((a) => tekstControle(nr, n, a, "antwoord")); }
    if (!q.why) fout(nr, n, `‘${q.q}’: verwijzing ontbreekt`);
    else for (const r of String(q.why).split(/;\s*/)) if (verses(r) !== "ok") fout(nr, n, `‘${q.q}’: verwijzing ${r}: ${verses(r)}`);
  }
}

for (const [nrS, lv] of Object.entries(kandidaat)) {
  const nr = +nrS, g = G.get(nr);
  if (!g) { fout(nr, "", "geschiedenis bestaat niet"); continue; }
  const pl = plaatsenVan(g);
  for (const n of ["a", "b", "c"]) {
    const v = lv[n];
    if (!v) { if (volledig || bestand) fout(nr, n, "versie ontbreekt"); continue; }
    const json = JSON.stringify(v), refs = [g.ref, ...refsIn(json, g), ...(v.verdieping || []).flatMap((d) => d.refs || []), ...(v.vragen || []).flatMap((q) => String(q.why || "").split(/;\s*/))];
    const bron = refs.map(tekstVan).join(" ");
    bereik = norm(bron); bereikHL = normHL(bron);
    if (!["concept", "gecontroleerd", "goedgekeurd"].includes(v.status)) fout(nr, n, `status ‘${v.status}’`);
    if (volledig && v.status === "concept") fout(nr, n, "staat nog op concept");
    if (n === "a") {
      if (!Array.isArray(v.delen) || v.delen.length < 4 || v.delen.length > 10) fout(nr, n, `aantal stappen ${v.delen ? v.delen.length : 0}, verwacht 4–10`);
      for (const d of v.delen || []) {
        tekstControle(nr, n, d.t, "stap");
        if (d.t && d.t.length > 140) fout(nr, n, `stap te lang (${d.t.length}): ${d.t.slice(0, 40)}…`);
        if (d.t && zinnen(d.t) > 3) fout(nr, n, `stap heeft meer dan 3 zinnen: ${d.t.slice(0, 40)}…`);
        if (d.t && /\b\d{3,4}\b/.test(d.t)) fout(nr, n, `jaartal of groot getal in stap: ${d.t.slice(0, 40)}…`);
        if (d.stap && !(g.stappen || []).includes(d.stap)) fout(nr, n, `stap ${d.stap} hoort niet bij de geschiedenis`);
      }
      tekstControle(nr, n, v.samen, "tip voor wie voorleest");
      if (v.samen && v.samen.length > 520) fout(nr, n, `tip te lang (${v.samen.length})`);
      vragen(nr, n, v.vragen, 2, 2, 4);
      if (v.plaatsen !== undefined) { if (!Array.isArray(v.plaatsen)) fout(nr, n, "plaatsen is geen lijst"); else for (const p of v.plaatsen) if (!BR.plaatsen[p] || !pl.has(p)) fout(nr, n, `plaats ${p} hoort niet bij de geschiedenis`); }
    }
    if (n === "b") {
      if (!Array.isArray(v.delen) || v.delen.length < 2 || v.delen.length > 4) fout(nr, n, `aantal onderdelen ${v.delen ? v.delen.length : 0}, verwacht 2–4`);
      let len = 0;
      for (const d of v.delen || []) {
        tekstControle(nr, n, d.t, "onderdeel"); tekstControle(nr, n, d.kop, "kop"); len += (d.t || "").length;
        if (d.kop && (d.kop.length > 42 || /[.!?:;]$/.test(d.kop))) fout(nr, n, `kop ‘${d.kop}’: max. 42 tekens, geen leesteken aan het eind`);
        if (d.stap && !(g.stappen || []).includes(d.stap)) fout(nr, n, `stap ${d.stap} hoort niet bij de geschiedenis`);
      }
      if (len > 1000) fout(nr, n, `vertelling te lang (${len} tekens, max. 1000)`);
      if (len && len < 300) fout(nr, n, `vertelling erg kort (${len} tekens)`);
      vragen(nr, n, v.vragen, 3, 3, 5);
    }
    if (n === "c") {
      if (!Array.isArray(v.verdieping) || v.verdieping.length < 1 || v.verdieping.length > 3) fout(nr, n, `aantal verdiepingsblokken ${v.verdieping ? v.verdieping.length : 0}, verwacht 1–3`);
      for (const d of v.verdieping || []) {
        tekstControle(nr, n, d.kop, "kop"); tekstControle(nr, n, d.t, "verdieping");
        if (d.t && d.t.length > 750) fout(nr, n, `verdiepingsblok te lang (${d.t.length})`);
        for (const r of d.refs || []) if (verses(r) !== "ok") fout(nr, n, `verwijzing ${r}: ${verses(r)}`);
      }
      vragen(nr, n, v.vragen, 3, 2, 4);
      // Niet dezelfde vragen als de bestaande quiz.
      const oud = new Set((g.quiz || []).map((q) => norm(q.q)));
      for (const q of v.vragen || []) if (oud.has(norm(q.q))) fout(nr, n, `‘${q.q}’ staat al in de bestaande vragen`);
    }
  }
}
if (volledig) for (const nr of G.keys()) if (!kandidaat[nr]) fout(nr, "", "geen niveauversies");
const n = Object.keys(kandidaat).length;
if (fouten.length) { console.log(fouten.join("\n")); console.log(`\n${fouten.length} fout(en) in ${n} geschiedenis(sen).`); process.exit(1); }
console.log(`OK: ${n} geschiedenis(sen), ${Object.values(kandidaat).reduce((a, lv) => a + ["a", "b", "c"].filter((x) => lv[x]).length, 0)} versies.`);
