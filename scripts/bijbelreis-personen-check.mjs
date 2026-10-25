// Controleert BR.mensen (public/bijbelreis/personen.js) tegen de inhoud van de Bijbelreis, zonder browser.
// Gebruik: node scripts/bijbelreis-personen-check.mjs        Exitcode 1 bij fouten; waarschuwingen laten de exitcode op 0.
// Controles:
//  - v/m/p verwijzen naar bestaande ids; boek-ids bestaan; geen cycli in de ouders (niemand is zijn eigen voorouder);
//  - elke individuele naam in `who` (stappen en deel-intro's), in de `wie`-lijsten en in de Genesis-stamboom is te koppelen
//    via n/alias binnen `boek` (groepen en rollen zonder naam worden genegeerd en apart getoond);
//  - geen naam wijst binnen één boek naar twee personen (fout als de naam in `who`/`wie` van dat boek staat, anders waarschuwing);
//  - elke verwijzing (geb, dood, leeftijd, elders, vervolg) is leesbaar en gedekt door een regel in scripts/bijbel-controle/personen.txt.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("../", import.meta.url).pathname;
const pub = join(root, "public");
const dir = join(pub, "bijbelreis");

// ---------- laden (zoals de pagina: plaatsen.js, personen.js, daarna de inhoud in de volgorde van de HTML) ----------
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const html = existsSync(join(pub, "bijbelreis.html")) ? readFileSync(join(pub, "bijbelreis.html"), "utf8") : "";
let inhoud = [...html.matchAll(/src="\/bijbelreis\/(inhoud\/[^"?]+)/g)].map((m) => m[1]);
for (const f of readdirSync(join(dir, "inhoud")).filter((f) => f.endsWith(".js")).sort()) if (!inhoud.includes("inhoud/" + f)) inhoud.push("inhoud/" + f);
for (const f of ["plaatsen.js", "personen.js", ...inhoud]) {
  try { vm.runInContext(readFileSync(join(dir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { console.error(`FOUT bij laden van ${f}: ${e.message}`); process.exit(1); }
}
const BR = ctx.BR;
const M = BR.mensen || {};
const ids = Object.keys(M);
const boekIds = new Set(BR.boeken.map((b) => b.id));

const errors = [], warnings = [];
const err = (s) => errors.push(s), warn = (s) => warnings.push(s);

// Groepen (staan nooit in BR.mensen) en rollen zonder naam (‘Koning’, ‘Weduwe’): bewust niet gekoppeld.
const GROEPEN = new Set(["Mannen", "Bezoekers", "Koningen", "Broers", "Kinderen", "Familie", "Mensen", "Volk", "Soldaten", "Leger", "Spionnen",
  "Vrouwen", "Priesters", "Profeten", "Vijanden", "Knechten", "Boden", "Zonen", "Dochters", "Amalek", "Filistijnen", "Midianieten", "Gibeonieten",
  "Oudsten", "Arbeiders", "Raven", "Melaatsen", "Lopers", "Bouwers", "Zeelieden", "Vrienden", "Egyptenaren", "Edomieten"]);
const ROLLEN = new Set(["Farao", "Farao’s dochter", "Knecht", "Schenker", "Losser", "De andere losser", "Wapendrager", "Koningin",
  "De koningin van Scheba", "Koning", "Weduwe", "Zoon", "Jongen", "Engel", "Meisje", "Het meisje uit Israël", "Sunamitische", "De Sunamitische"]);

// ---------- 1. structuur van elke persoon ----------
const SLUGS = { psalm: "psalmen", psalmen: "psalmen" };
const slug = (b) => { const s = b.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s/g, ""); return SLUGS[s] || s; };
const bijbel = new Set(readdirSync(join(dir, "bijbel")).map((f) => f.replace(/\.json$/, "")));
function parseRef(ref) { // zelfde vormen als parseRef in app.js: "Boek 1:2", "1:2–5", "1:2–3:4", "1–3", "1:2; 3:4"
  const m = String(ref).match(/^(\d?\s?[A-Za-zëéïü]+)\s+(.+)$/);
  if (!m) return null;
  const s = slug(m[1]); if (!bijbel.has(s)) return null;
  const out = []; let last = null;
  for (const p of m[2].split(";").map((x) => x.trim()).filter(Boolean)) {
    let r;
    if ((r = p.match(/^(\d+):(\d+)[–-](\d+):(\d+)$/))) out.push([+r[1], +r[2], +r[3], +r[4]]);
    else if ((r = p.match(/^(\d+):(\d+)[–-](\d+)$/))) out.push([+r[1], +r[2], +r[1], +r[3]]);
    else if ((r = p.match(/^(\d+):(\d+)$/))) out.push([+r[1], +r[2], +r[1], +r[2]]);
    else if ((r = p.match(/^(\d+)[–-](\d+)$/))) out.push([+r[1], 1, +r[2], 999]);
    else if ((r = p.match(/^(\d+)$/))) out.push([+r[1], 1, +r[1], 999]);
    else if (last !== null && (r = p.match(/^(\d+)[–-]?(\d+)?$/))) out.push([last, +r[1], last, +(r[2] || r[1])]);
    else return null;
    last = out[out.length - 1][2];
  }
  return { slug: s, ranges: out };
}
// regels uit het controlebestand (alleen de verwijzing, de regex is voor bijbel-check.py)
const controle = join(root, "scripts", "bijbel-controle", "personen.txt");
const gedekt = existsSync(controle) ? readFileSync(controle, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#")).map((l) => parseRef(l.split("|")[0].trim())).filter(Boolean) : [];
if (!gedekt.length) err("scripts/bijbel-controle/personen.txt ontbreekt of is leeg");
const binnen = (c, v, [c1, v1, c2, v2]) => (c > c1 || (c === c1 && v >= v1)) && (c < c2 || (c === c2 && v <= v2));
const isGedekt = (q) => q.ranges.every((rg) => gedekt.some((g) => g.slug === q.slug && g.ranges.some(([c, v]) => binnen(c, v, rg))));

for (const [id, m] of Object.entries(M)) {
  if (!/^[a-z0-9_]+$/.test(id)) err(`${id}: id alleen kleine letters, cijfers en _`);
  if (!m.n) err(`${id}: geen naam (n)`);
  for (const k of ["v", "m"]) if (m[k] !== undefined && !M[m[k]]) err(`${id}: ${k} = "${m[k]}" bestaat niet`);
  if (m.v && m.v === m.m) err(`${id}: vader en moeder zijn dezelfde persoon`);
  for (const p of m.p || []) {
    if (!M[p]) err(`${id}: p bevat "${p}", die bestaat niet`);
    else if (!(M[p].p || []).includes(id)) warn(`${id}: getrouwd met ${p}, maar ${p}.p noemt ${id} niet`);
  }
  if (!Array.isArray(m.boek)) err(`${id}: boek ontbreekt (gebruik [] als de persoon niet in de reis staat)`);
  for (const b of m.boek || []) if (!boekIds.has(b)) err(`${id}: onbekend boek "${b}"`);
  const refs = [["geb", m.geb], ["dood", m.dood], ...(m.leeftijd || []).map(([a, r]) => [`leeftijd ${a}`, r]), ...(m.elders || []).map(([r]) => ["elders", r]), ...(m.vervolg || []).map(([r]) => ["vervolg", r])].filter(([, r]) => r);
  for (const [soort, r] of refs) {
    const q = parseRef(r);
    if (!q) err(`${id}: ${soort} "${r}" is geen leesbare verwijzing (of het bijbelboek ontbreekt in public/bijbelreis/bijbel/)`);
    else if (!isGedekt(q)) err(`${id}: ${soort} "${r}" staat niet in scripts/bijbel-controle/personen.txt`);
  }
}

// ---------- 2. geen cycli in de ouders ----------
for (const id of ids) {
  const seen = new Set(), stack = [id];
  while (stack.length) {
    const x = stack.pop();
    for (const p of [M[x]?.v, M[x]?.m].filter((p) => p && M[p])) {
      if (p === id) { err(`${id}: is (via ${x}) zijn eigen voorouder`); stack.length = 0; break; }
      if (!seen.has(p)) { seen.add(p); stack.push(p); }
    }
  }
}

// ---------- 3. namen per boek ----------
const idx = {}; // boek -> naam -> [ids]
for (const [id, m] of Object.entries(M)) for (const n of [m.n, ...(m.alias || [])]) for (const b of m.boek || []) ((idx[b] ??= {})[n] ??= []).push(id);
const genegeerd = {}, gebruikt = {}; // boek -> Set(naam)
const ignore = (b, n, waar) => { (genegeerd[n] ??= new Set()).add(`${b} (${waar})`); };
for (const b of BR.boeken) {
  const namen = new Map(); // naam -> [waar]
  const add = (n, waar) => { if (!namen.has(n)) namen.set(n, []); namen.get(n).push(waar); };
  for (const d of b.delen) {
    for (const [n] of d.who || []) add(n, `${d.id}:intro`);
    d.steps.forEach((s, i) => (s.who || []).forEach(([n]) => add(n, `${d.id}:${i}`)));
  }
  const wie = new Map();
  for (const x of b.wie || []) for (const n of String(x.n).split(/ en /)) wie.set(n.trim(), x.n);
  const stamboom = new Set();
  if (b.stamboom) { for (const x of (b.stamboom.rijen || []).flat()) stamboom.add(x.n); for (const [n] of b.stamboom.leeftijden || []) stamboom.add(n); }
  gebruikt[b.id] = new Set([...namen.keys(), ...wie.keys(), ...stamboom]);
  for (const [n, waar] of namen) {
    if (GROEPEN.has(n) || ROLLEN.has(n)) { ignore(b.id, n, "who"); continue; }
    const hit = idx[b.id]?.[n] || [];
    if (!hit.length) err(`${b.id}: ‘${n}’ in who (${waar.slice(0, 4).join(", ")}${waar.length > 4 ? ", …" : ""}) is niet gekoppeld aan BR.mensen`);
    if (hit.length > 1) err(`${b.id}: ‘${n}’ in who wijst naar meer personen: ${hit.join(", ")}`);
  }
  for (const [n, orig] of wie) {
    if (GROEPEN.has(n) || ROLLEN.has(n) || GROEPEN.has(orig) || ROLLEN.has(orig)) { ignore(b.id, orig, "wie"); continue; }
    const hit = idx[b.id]?.[n] || [];
    if (!hit.length) err(`${b.id}: ‘${n}’ in de wie-lijst is niet gekoppeld aan BR.mensen`);
    if (hit.length > 1) err(`${b.id}: ‘${n}’ in de wie-lijst wijst naar meer personen: ${hit.join(", ")}`);
  }
  for (const n of stamboom) {
    const hit = idx[b.id]?.[n] || [];
    if (!hit.length) err(`${b.id}: ‘${n}’ in de stamboom is niet gekoppeld aan BR.mensen`);
    if (hit.length > 1) warn(`${b.id}: ‘${n}’ in de stamboom kan ${hit.join(" of ")} zijn; de app kiest ${hit[hit.length - 1]} (laatste in personen.js)`);
  }
  // dubbele namen die (nog) niet in deze inhoud voorkomen
  for (const [n, hit] of Object.entries(idx[b.id] || {})) if (hit.length > 1 && !namen.has(n) && !wie.has(n) && !stamboom.has(n)) warn(`${b.id}: de naam ‘${n}’ hoort bij ${hit.join(" en ")}`);
}
// boek genoemd bij een persoon, maar de naam komt daar niet (meer) voor
for (const [id, m] of Object.entries(M)) for (const b of m.boek || []) if (gebruikt[b] && ![m.n, ...(m.alias || [])].some((n) => gebruikt[b].has(n))) warn(`${id}: boek "${b}", maar ${m.n} staat daar niet in who/wie/stamboom`);

// ---------- rapport ----------
const nBoek = ids.filter((id) => (M[id].boek || []).length).length;
console.log(`BR.mensen: ${ids.length} personen (${nBoek} in de reis, ${ids.length - nBoek} alleen voor de familie).`);
console.log(`Genegeerde groepen en rollen: ${Object.entries(genegeerd).map(([n, s]) => `${n} [${[...s].map((x) => x.split(" ")[0]).filter((x, i, a) => a.indexOf(x) === i).join(", ")}]`).join("; ")}`);
if (warnings.length) console.log(`\nWaarschuwingen (${warnings.length}):\n  ` + warnings.join("\n  "));
if (errors.length) console.log(`\nFOUTEN (${errors.length}):\n  ` + errors.join("\n  "));
else console.log("\nGeen fouten.");
process.exit(errors.length ? 1 : 0);
