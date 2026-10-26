// Controleert BR.mensen (public/bijbelreis/personen.js) tegen de inhoud van de Bijbelreis, zonder browser.
// Gebruik: node scripts/bijbelreis-personen-check.mjs [--toon] [--streng]
//   --toon    toont per naamgenoot (zie NAAMGENOTEN) elke plek en de persoon waaraan de app de naam koppelt (steekproef);
//   --streng  telt ook de bekende inhoudsfouten (BEKEND, buiten personen.js op te lossen) als fout.
// Exitcode 1 bij fouten; waarschuwingen laten de exitcode op 0.
// Controles:
//  1. structuur: v/m/p verwijzen naar bestaande ids, boek-ids bestaan, elke verwijzing (geb, dood, leeftijd, elders, vervolg)
//     is leesbaar en gedekt door een regel in scripts/bijbel-controle/personen.txt;
//  2. grondslag (veld basis): elke v, m en p heeft een grondslag [soort, ref, toelichting?] met soort "b" (expliciet in de
//     Bijbel) of "a" (afgeleid, met redenering), een leesbare verwijzing die door personen.txt gedekt is, en geen grondslag
//     zonder familieband; kerkelijke overlevering staat nooit in v/m/p maar alleen in `overlevering` ([[tekst, toelichting]]);
//  3. geen cycli in de ouders;
//  4. koppeling precies zoals app.js: per boek één persoon per naam (`boek|naam`, n of alias), en alleen bij de geschiedenissen
//     een terugval op een naam die maar één persoon heeft (mensIn). Twee personen met dezelfde naam in één boek is een fout;
//  5. elke naam in `who` (stappen en deel-intro's), in de wie-lijsten (gesplitst op ‘ en ’, ‘, ’, ‘ / ’), in de Genesis-stamboom,
//     in `wie` van elke geschiedenis (boek van de eerste stap; zonder stap globaal) en in elke ontdek-stamboom wordt gekoppeld,
//     of is een bekende groep/rol, of staat bewust ongekoppeld in ONGEKOPPELD;
//  6. bij naamgenoten (dezelfde naam bij meer personen, of in de Bijbel meer mensen: NAAMGENOTEN) is per plek vastgelegd welke
//     persoon bedoeld is (VERWACHT); de koppeling moet precies die persoon geven.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("../", import.meta.url).pathname;
const pub = join(root, "public");
const dir = join(pub, "bijbelreis");
const TOON = process.argv.includes("--toon"), STRENG = process.argv.includes("--streng");

// ---------- laden (zoals de pagina: plaatsen.js, personen.js, daarna de inhoud in de volgorde van de HTML) ----------
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const html = existsSync(join(pub, "bijbelreis.html")) ? readFileSync(join(pub, "bijbelreis.html"), "utf8") : "";
const uitHtml = (map) => [...html.matchAll(new RegExp(`src="/bijbelreis/(${map}/[^"?]+)`, "g"))].map((m) => m[1]);
const scripts = (map) => {
  const lijst = uitHtml(map);
  if (existsSync(join(dir, map))) for (const f of readdirSync(join(dir, map)).filter((f) => f.endsWith(".js")).sort()) if (!lijst.includes(`${map}/${f}`)) lijst.push(`${map}/${f}`);
  return lijst;
};
for (const f of ["plaatsen.js", "personen.js", ...scripts("inhoud"), ...scripts("geschiedenissen")]) {
  try { vm.runInContext(readFileSync(join(dir, f), "utf8"), ctx, { filename: f }); }
  catch (e) { console.error(`FOUT bij laden van ${f}: ${e.message}`); process.exit(1); }
}
const BR = ctx.BR;
const M = BR.mensen || {};
const ids = Object.keys(M);
const boekIds = new Set(BR.boeken.map((b) => b.id));
const G = BR.geschiedenissen || [];

const errors = [], warnings = [], bekendGezien = new Set();
const err = (s) => errors.push(s), warn = (s) => warnings.push(s);

// Groepen (staan nooit in BR.mensen) en rollen zonder naam (‘Koning’, ‘Weduwe’): bewust niet gekoppeld.
const GROEPEN = new Set(["Mannen", "Bezoekers", "Koningen", "Broers", "Kinderen", "Familie", "Mensen", "Volk", "Soldaten", "Leger", "Spionnen",
  "Vrouwen", "Priesters", "Profeten", "Vijanden", "Knechten", "Boden", "Zonen", "Dochters", "Amalek", "Filistijnen", "Midianieten", "Gibeonieten",
  "Oudsten", "Arbeiders", "Raven", "Melaatsen", "Lopers", "Bouwers", "Zeelieden", "Vrienden", "Egyptenaren", "Edomieten",
  // Nieuwe Testament (versie 3.0)
  "Discipelen", "Apostelen", "Schare", "Engelen", "Herders", "Wijzen", "Joden", "Ouders", "Farizeeën", "Sadduceeën", "Overpriesters",
  "Tollenaars", "Handelaars", "Moordenaars", "Raad", "Wachters", "Weduwen", "Broeders", "Reisgenoten", "Ouderlingen", "Bemanning",
  "Eilanders", "Gemeente",
  // Wie-lijst Handelingen: één item over drie verschillende mannen met de naam Ananias (5:1, 9:10, 23:2).
  "Drie mannen Ananias"]);
const ROLLEN = new Set(["Farao", "Bakker", "Farao’s dochter", "Knecht", "Schenker", "Losser", "De andere losser", "Wapendrager", "Koningin",
  "De koningin van Scheba", "Koning", "Weduwe", "Zoon", "Jongen", "Engel", "Meisje", "Het meisje uit Israël", "Sunamitische", "De Sunamitische",
  // Nieuwe Testament (versie 3.0). ‘Discipel’ is de discipel die Jezus liefhad (of de tweede Emmaüsganger): niet invullen.
  "Discipel", "Hoofdman", "Overste", "Vrouw", "Verlamde", "Zieke man", "Blindgeborene", "Wetgeleerde", "Waterzuchtige man", "Samaritaan",
  "Rijke jongeman", "Dochter van Herodias", "Dienstmaagd", "Kreupele", "Kamerling", "Gevangenbewaarder", "Neef",
  // Geen mens: bewust niet in BR.mensen.
  "Satan"]);
// Namen in een ontdek-stamboom die bewust niet gekoppeld worden (sleutel: g<nr>|naam).
const ONGEKOPPELD = {
  "g4|Adam en Eva": "twee namen in één vakje; Adam en Eva staan elk ook los in de geschiedenis",
  "g4|Henoch (een andere Henoch dan in Genesis 5)": "de zoon van Kaïn (Genesis 4:17), niet in BR.mensen; bewust niet de Henoch van Genesis 5",
  "g16|Bilha (slavin van Rachel)": "naam met toelichting; de app koppelt dit vakje niet (Bilha staat los in de wie-lijst)",
  "g16|Zilpa (slavin van Lea)": "naam met toelichting; de app koppelt dit vakje niet (Zilpa staat los in de wie-lijst)",
  "g16|Benjamin (later geboren, 35:18)": "naam met toelichting; de app koppelt dit vakje niet",
  "g47|Perez": "voorvader in Ruth 4:18–22, niet in BR.mensen", "g47|Hezron": "voorvader in Ruth 4:18–22, niet in BR.mensen",
  "g47|Ram": "voorvader in Ruth 4:18–22, niet in BR.mensen", "g47|Amminadab": "voorvader in Ruth 4:18–22, niet in BR.mensen",
  "g47|Nahesson": "voorvader in Ruth 4:18–22, niet in BR.mensen",
  "g65|Amazia": "zoon van Joas van Juda, niet in BR.mensen",
  "g89|Jonas (vader)": "vader van Petrus; bewust als vakje met toelichting (de persoon jonas staat bij Petrus als vader)",
  "g89|Zebedeüs (vader)": "vader van Jakobus en Johannes; bewust als vakje met toelichting",
};
// Namen die in de Bijbel meer dan één persoon aanduiden, ook als BR.mensen er maar één van kent. Voor deze namen (en voor
// elke naam die bij meer personen in BR.mensen hoort) moet per plek in VERWACHT staan wie bedoeld is.
const NAAMGENOTEN = new Set(["Nahor", "Jozef", "Simeon", "Gad", "Manasse", "Jozua", "Hosea", "Jabin", "Joas", "Jerobeam", "Darius", "Ahasveros",
  "Abimelech", "Benhadad", "Achis", "Hiram", "Hilkia", "Jonathan", "Nathan", "Obadja", "Johanan", "Joram", "Ahazia", "Zacharia", "Zacharias",
  "Herodes", "Maria", "Johannes", "Jakobus", "Simon", "Filippus", "Judas", "Ananias", "Lazarus", "Eli"]);
// Verwachte persoon per plek. Sleutels van specifiek naar algemeen: `g<nr>:stamboom|naam`, `g<nr>|naam`, `<boek>:wie|naam`,
// `<boek>|naam` (geldt voor who en wie-lijst van dat boek en voor geschiedenissen waarvan de eerste stap in dat boek ligt).
// null = de naam mag hier aan geen persoon gekoppeld worden.
const VERWACHT = {
  "genesis|Nahor": "nahor", "genesis|Jozef": "jozef", "jozua|Jozef": "jozef", "jezus-1|Jozef": "jozef_nt",
  "genesis|Simeon": "simeon", "jezus-1|Simeon": "simeon_nt", "genesis|Gad": "gad", "2samuel|Gad": "gad_ziener", "genesis|Manasse": "manasse",
  "exodus|Jozua": "jozua", "numeri|Jozua": "jozua", "jozua|Jozua": "jozua", "2koningen|Hosea": "hosea",
  "jozua|Jabin": "jabin_jozua", "richteren|Jabin": "jabin_richteren",
  "richteren|Joas": "joas_abiezriet", "2koningen|Joas": "joas_israel", "g65:stamboom|Joas": "joas_juda",
  "1koningen|Jerobeam": "jerobeam_1", "jona|Jerobeam": "jerobeam_2", "daniel|Darius": "darius_meder", "ezra|Darius": "darius_pers",
  "esther|Ahasveros": "ahasveros", "genesis|Abimelech": "abimelech", "2koningen|Benhadad": "benhadad", "1samuel|Achis": "achis",
  "1koningen|Hiram": "hiram", "2koningen|Hilkia": "hilkia", "1samuel|Jonathan": "jonathan", "1koningen|Nathan": "nathan", "2samuel|Nathan": "nathan",
  "1koningen|Obadja": "obadja", "profeten|Johanan": "johanan", "2koningen|Joram": "joram_juda", "2koningen|Ahazia": "ahazia_juda",
  "ezra|Zacharia": "zacharia", "profeten|Zacharia": "zacharia", "jezus-1|Zacharias": "zacharias", "jezus-1|Herodes": "herodes",
  "handelingen|Herodes": "herodes_agrippa", "jezus-1|Maria": "maria", "jezus-3|Maria": "maria", "jezus-2|Maria": "maria_bethanie",
  "jezus-1|Johannes": "johannes", "jezus-2|Johannes": "johannes", "jezus-3|Johannes": "johannes", "handelingen|Johannes": "johannes",
  "openbaring|Johannes": "johannes_patmos", "jezus-1|Jakobus": "jakobus", "jezus-2|Jakobus": "jakobus", "jezus-3|Jakobus": "jakobus",
  "jezus-1|Filippus": "filippus", "jezus-2|Filippus": "filippus", "handelingen|Filippus": "filippus_evangelist",
  "handelingen|Ananias": "ananias", "handelingen:wie|Ananias": null, "jezus-2|Lazarus": "lazarus", "1samuel|Eli": "eli",
};
// Bekende inhoudsfouten die alleen buiten personen.js op te lossen zijn (inhoud of geschiedenissen). Ze staan hier met de
// koppeling die de app nu geeft; verandert die, dan meldt de check dat de lijst bijgewerkt moet worden. Met --streng: fout.
const BEKEND = {
  // Leeg: ‘Joas’ in geschiedenis 65 is ‘Joas van Juda’ geworden en het wie-item ‘Ananias’ heet ‘Drie mannen Ananias’ (3.0).
};

// Eén regel in een wie-lijst kan meer namen bevatten: ‘Nadab en Abihu’, ‘Silas, Timotheüs en Lydia’, ‘Saulus / Paulus’.
const SPLIT = / en |, | \/ /;
const splitWie = (s) => String(s).split(SPLIT).map((n) => n.trim()).filter(Boolean);

// ---------- 1. structuur van elke persoon ----------
const SLUGS = { psalm: "psalmen", psalmen: "psalmen" };
const slug = (b) => { const s = b.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s/g, ""); return SLUGS[s] || s; };
const bijbel = new Set(readdirSync(join(dir, "..", "..", "data", "statenvertaling")).map((f) => f.replace(/\.json$/, "")));
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
    else if (!(M[p].p || []).includes(id)) err(`${id}: getrouwd met ${p}, maar ${p}.p noemt ${id} niet`);
  }
  if (!Array.isArray(m.boek)) err(`${id}: boek ontbreekt (gebruik [] als de persoon niet in de reis staat)`);
  for (const b of m.boek || []) if (!boekIds.has(b)) err(`${id}: onbekend boek "${b}"`);
  const refs = [["geb", m.geb], ["dood", m.dood], ...(m.leeftijd || []).map(([a, r]) => [`leeftijd ${a}`, r]), ...(m.elders || []).map(([r]) => ["elders", r]), ...(m.vervolg || []).map(([r]) => ["vervolg", r])].filter(([, r]) => r);
  for (const [soort, r] of refs) {
    const q = parseRef(r);
    if (!q) err(`${id}: ${soort} "${r}" is geen leesbare verwijzing (of het bijbelboek ontbreekt in data/statenvertaling/)`);
    else if (!isGedekt(q)) err(`${id}: ${soort} "${r}" staat niet in scripts/bijbel-controle/personen.txt`);
  }
}

// ---------- 2. grondslag (basis) en overlevering ----------
const telSoort = { b: 0, a: 0 };
let nOverlevering = 0;
const ROL = { v: "vader", m: "moeder" };
function checkGrondslag(wie, g) {
  if (!Array.isArray(g)) return err(`${wie}: geen grondslag in basis`);
  const [soort, ref, toel] = g;
  if (soort === "o" || /overlevering/i.test(String(soort))) return err(`${wie}: overlevering hoort niet in v/m/p; zet die in \`overlevering\` en haal de band weg`);
  if (!["b", "a"].includes(soort)) return err(`${wie}: onbekende soort "${soort}" (alleen "b" of "a")`);
  telSoort[soort]++;
  if (g.length > 3 || (toel !== undefined && typeof toel !== "string")) err(`${wie}: grondslag heeft de vorm [soort, ref, toelichting?]`);
  if (soort === "a" && !(typeof toel === "string" && toel.trim().length > 10)) err(`${wie}: afgeleid ("a") zonder redenering`);
  const q = typeof ref === "string" ? parseRef(ref) : null;
  if (!q) err(`${wie}: verwijzing "${ref}" is niet leesbaar (of het bijbelboek ontbreekt)`);
  else if (!isGedekt(q)) err(`${wie}: verwijzing "${ref}" staat niet in scripts/bijbel-controle/personen.txt`);
}
for (const [id, m] of Object.entries(M)) {
  const b = m.basis;
  if (b !== undefined && (typeof b !== "object" || Array.isArray(b))) { err(`${id}: basis is geen object`); continue; }
  for (const k of Object.keys(b || {})) if (!["v", "m", "p"].includes(k)) err(`${id}: basis.${k} is onbekend (alleen v, m, p)`);
  for (const k of ["v", "m"]) {
    if (m[k]) checkGrondslag(`${id} → ${ROL[k]} ${m[k]}`, b?.[k]);
    else if (b?.[k]) err(`${id}: basis.${k} zonder ${ROL[k]} (haal de grondslag weg)`);
  }
  for (const p of m.p || []) {
    checkGrondslag(`${id} → partner ${p}`, b?.p?.[p]);
    const terug = M[p]?.basis?.p?.[id];
    if (b?.p?.[p] && terug && terug[0] !== b.p[p][0]) err(`${id} ↔ ${p}: de grondslag verschilt per kant (${b.p[p][0]} tegenover ${terug[0]})`);
  }
  for (const p of Object.keys(b?.p || {})) if (!(m.p || []).includes(p)) err(`${id}: basis.p.${p} zonder partner ${p} in p`);
  if (m.overlevering !== undefined) {
    if (!Array.isArray(m.overlevering) || !m.overlevering.length) err(`${id}: overlevering is geen lijst [[tekst, toelichting]]`);
    else for (const o of m.overlevering) {
      if (!Array.isArray(o) || o.length !== 2 || o.some((x) => typeof x !== "string" || !x.trim())) err(`${id}: overlevering-regel heeft de vorm [tekst, toelichting]`);
      else { nOverlevering++; if (!/niet|Bijbel/.test(o[1])) warn(`${id}: de toelichting bij de overlevering zegt niet dat het niet in de Bijbel staat`); }
    }
  }
}

// ---------- 3. geen cycli in de ouders ----------
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

// ---------- 4. index zoals app.js ----------
const MENS_IDX = {}, NAAM_IDS = {};
for (const [id, m] of Object.entries(M)) for (const n of [m.n, ...(m.alias || [])]) {
  (NAAM_IDS[n] ??= new Set()).add(id);
  for (const b of m.boek || []) {
    const k = `${b}|${n}`;
    if (MENS_IDX[k] && MENS_IDX[k] !== id) err(`${k}: ${MENS_IDX[k]} en ${id} hebben dezelfde naam in hetzelfde boek (de app voegt ze samen)`);
    MENS_IDX[k] = id;
  }
}
for (const [n, s] of Object.entries(NAAM_IDS)) if (s.size === 1) MENS_IDX[`*|${n}`] = [...s][0];
const mensOf = (n, b) => MENS_IDX[`${b}|${n}`] || null;
const mensIn = (n, b) => mensOf(n, b) || MENS_IDX[`*|${n}`] || null;
const STEP_BY_KEY = new Map();
for (const b of BR.boeken) for (const d of b.delen) d.steps.forEach((s, i) => STEP_BY_KEY.set(`${b.id}:${d.id}:${i}`, { b, d, i }));
const verhaalBoek = (g) => { const s = (g.stappen || []).map((x) => STEP_BY_KEY.get(x)).find(Boolean); return s ? s.b.id : "*"; };

// ---------- 5 en 6. elke plek waar een naam staat ----------
const genegeerd = {}, gebruikt = {}, toon = [];
const naamgenoot = (n) => NAAMGENOTEN.has(n) || (NAAM_IDS[n]?.size || 0) > 1;
// plek = { boek, soort: "who" | "wie" | "stamboom" | "gesch" | "gstamboom", waar, nr? }
function koppel(n, plek, id) {
  const sleutels = [plek.nr ? `g${plek.nr}:${plek.soort === "gstamboom" ? "stamboom" : "wie"}|${n}` : null, plek.nr ? `g${plek.nr}|${n}` : null,
    `${plek.boek}:${plek.soort === "wie" ? "wie" : plek.soort}|${n}`, `${plek.boek}|${n}`].filter(Boolean);
  const k = sleutels.find((s) => s in VERWACHT);
  const bekend = sleutels.find((s) => s in BEKEND);
  const waar = `${plek.boek}${plek.nr ? ` geschiedenis ${plek.nr}` : ""} (${plek.waar})`;
  if (naamgenoot(n)) toon.push(`${n.padEnd(14)} ${waar.padEnd(48)} → ${id || "—"}${k ? (VERWACHT[k] === id ? "  ✓" : `  ✗ verwacht ${VERWACHT[k]}`) : "  ? geen verwachting"}`);
  if (bekend) {
    bekendGezien.add(bekend);
    if (BEKEND[bekend].krijgt !== id) err(`BEKEND ‘${bekend}’ geeft nu ${id || "geen persoon"} in plaats van ${BEKEND[bekend].krijgt}: werk BEKEND/VERWACHT bij`);
    else if (STRENG) err(`${waar}: ‘${n}’ → ${id}, bedoeld ${VERWACHT[k] ?? "geen persoon"} (bekend: ${BEKEND[bekend].oplossing})`);
    return;
  }
  if (naamgenoot(n)) {
    if (!k) err(`${waar}: ‘${n}’ is een naamgenoot; leg in VERWACHT vast welke persoon hier bedoeld is (nu ${id || "geen"})`);
    else if (VERWACHT[k] !== id) err(`${waar}: ‘${n}’ wordt gekoppeld aan ${id || "geen persoon"}, maar bedoeld is ${VERWACHT[k] ?? "geen persoon"}`);
  }
}
function plekNaam(n, plek, id, mag = true) {
  if (GROEPEN.has(n) || ROLLEN.has(n)) { (genegeerd[n] ??= new Set()).add(plek.boek); return; }
  if (!id) {
    const sleutel = plek.nr ? `g${plek.nr}|${n}` : null;
    if (sleutel && ONGEKOPPELD[sleutel]) return;
    if (mag) err(`${plek.boek}${plek.nr ? ` geschiedenis ${plek.nr}` : ""} (${plek.waar}): ‘${n}’ is niet gekoppeld aan BR.mensen`);
    return;
  }
  koppel(n, plek, id);
}
for (const b of BR.boeken) {
  const namen = new Set();
  // who van deel-intro's en stappen: de app splitst hier niet en koppelt alleen binnen het boek (mensOf)
  for (const d of b.delen) {
    const lijsten = [[`${d.id}:intro`, d.who || []], ...d.steps.map((s, i) => [`${d.id}:${i}`, s.who || []])];
    for (const [waar, who] of lijsten) for (const [n] of who) {
      namen.add(n);
      if (SPLIT.test(n) && !GROEPEN.has(n) && !ROLLEN.has(n)) err(`${b.id} (${waar}): ‘${n}’ in who bevat meer namen; de app splitst who niet`);
      plekNaam(n, { boek: b.id, soort: "who", waar }, mensOf(n, b.id));
    }
  }
  // wie-lijst: de app splitst en koppelt binnen het boek
  for (const x of b.wie || []) {
    if (GROEPEN.has(x.n) || ROLLEN.has(x.n)) { (genegeerd[x.n] ??= new Set()).add(b.id); continue; }
    for (const n of splitWie(x.n)) { namen.add(n); plekNaam(n, { boek: b.id, soort: "wie", waar: `wie ‘${x.n}’` }, mensOf(n, b.id)); }
  }
  // Genesis-stamboom (rijen en leeftijden): wieInfoGenesis koppelt binnen het boek
  if (b.stamboom) {
    for (const x of (b.stamboom.rijen || []).flat()) { namen.add(x.n); plekNaam(x.n, { boek: b.id, soort: "stamboom", waar: "stamboom" }, mensOf(x.n, b.id)); }
    for (const [n] of b.stamboom.leeftijden || []) { namen.add(n); plekNaam(n, { boek: b.id, soort: "stamboom", waar: "leeftijden" }, mensOf(n, b.id)); }
  }
  gebruikt[b.id] = namen;
}
for (const g of G) {
  for (const k of g.stappen || []) if (!STEP_BY_KEY.has(k)) err(`geschiedenis ${g.nr}: stap ${k} bestaat niet`);
  const vb = verhaalBoek(g);
  for (const n of g.wie || []) {
    if (SPLIT.test(n) && !GROEPEN.has(n) && !ROLLEN.has(n)) err(`geschiedenis ${g.nr}: ‘${n}’ in wie bevat meer namen; de app splitst wie van een geschiedenis niet`);
    if (vb !== "*") (gebruikt[vb] ??= new Set()).add(n);
    plekNaam(n, { boek: vb, soort: "gesch", waar: "wie", nr: g.nr }, mensIn(n, vb));
  }
  const o = g.ontdek;
  if (o && o.soort === "stamboom") {
    const rijen = o.rijen || [];
    const lijst = rijen.length && rijen.every((r) => r.length === 3 && parseRef(r[2])); // [naam, relatie, ref] of rijen met namen
    for (const n of lijst ? rijen.map((r) => r[0]) : rijen.flat()) plekNaam(n, { boek: vb, soort: "gstamboom", waar: "ontdek-stamboom", nr: g.nr }, mensIn(n, vb));
  }
}
for (const k of Object.keys(BEKEND)) if (!bekendGezien.has(k)) err(`BEKEND ‘${k}’ komt niet meer voor: haal het uit de lijst`);
for (const k of Object.keys(ONGEKOPPELD)) {
  const [g, n] = [+k.slice(1, k.indexOf("|")), k.slice(k.indexOf("|") + 1)];
  const gg = G.find((x) => x.nr === g);
  const rijen = (gg?.ontdek?.rijen || []).flat();
  if (!rijen.includes(n)) err(`ONGEKOPPELD ‘${k}’ komt niet meer voor: haal het uit de lijst`);
  else if (mensIn(n, verhaalBoek(gg))) err(`ONGEKOPPELD ‘${k}’ wordt nu wél gekoppeld (${mensIn(n, verhaalBoek(gg))}): controleer en haal het uit de lijst`);
}
// boek genoemd bij een persoon, maar de naam komt daar niet (meer) voor
for (const [id, m] of Object.entries(M)) for (const b of m.boek || []) if (gebruikt[b] && ![m.n, ...(m.alias || [])].some((n) => gebruikt[b].has(n))) warn(`${id}: boek "${b}", maar ${m.n} staat daar niet in who/wie/stamboom`);

// ---------- rapport ----------
const nBoek = ids.filter((id) => (M[id].boek || []).length).length;
const nRel = ids.reduce((s, id) => s + (M[id].v ? 1 : 0) + (M[id].m ? 1 : 0) + (M[id].p || []).length, 0);
console.log(`BR.mensen: ${ids.length} personen (${nBoek} in de reis, ${ids.length - nBoek} alleen voor de familie).`);
console.log(`Familiebanden: ${nRel} (v/m/p per persoon; partners tellen per kant). Grondslag: ${telSoort.b} uit de Bijbel (b), ${telSoort.a} afgeleid (a). Overleveringen: ${nOverlevering}.`);
console.log(`Genegeerde groepen en rollen: ${Object.entries(genegeerd).map(([n, s]) => `${n} [${[...s].join(", ")}]`).join("; ")}`);
console.log(`Bewust ongekoppeld in ontdek-stambomen: ${Object.keys(ONGEKOPPELD).length}.`);
const bek = Object.entries(BEKEND);
if (bek.length) console.log(`\nBekende inhoudsfouten buiten personen.js (${bek.length}${STRENG ? ", tellen als fout" : "; met --streng een fout"}):\n  ` + bek.map(([k, x]) => `${k} → nu ${x.krijgt}: ${x.oplossing}`).join("\n  "));
if (TOON) console.log(`\nNaamgenoten: elke plek en de gekoppelde persoon (${toon.length}):\n  ` + toon.join("\n  "));
if (warnings.length) console.log(`\nWaarschuwingen (${warnings.length}):\n  ` + warnings.join("\n  "));
if (errors.length) console.log(`\nFOUTEN (${errors.length}):\n  ` + errors.join("\n  "));
else console.log("\nGeen fouten.");
process.exit(errors.length ? 1 : 0);
