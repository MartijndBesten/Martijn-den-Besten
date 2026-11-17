// Controle van een andere taal van de Bijbelreis (docs/bijbelreis-talen/README.md). Laadt de gegevens zoals de pagina
// /<taal>/ ze laadt (Nederlandse gegevens + taal/<taal>.js + taal/<taal>/*.js + taal/laag.js + de teksten per niveau) en
// controleert:
//   - sleutels: elke vertaalde stap, elk deel en elke geschiedenis bestaat in de Nederlandse gegevens; elke vertaalde
//     geschiedenis heeft alle drie de niveaus; de stappen waar ze naar wijzen, staan in de taal;
//   - geen Nederlands in de vertaalde velden (eenvoudige taalheuristiek);
//   - elke verwijzing bestaat in de KJV (hoofdstuk en vers, KJV-nummering);
//   - elk citaat tussen ‘…’ staat letterlijk in de KJV, in de verzen van de eigen verwijzing of van een verwijzing die
//     in dezelfde tekst genoemd wordt.
// Gebruik: node scripts/bijbelreis-talen-controle.mjs [taal]   (standaard en). Exitcode 1 bij een fout.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { citaatKlopt, citaten, refFout, refsIn, leesRef } from "./bijbelreis-kjv.mjs";
import { nederlandseWoorden } from "./bijbelreis-talen-woorden.mjs";

const run = (ctx, pad) => runInNewContext(readFileSync(pad, "utf8").replace(/\bBR\./g, "window.BR."), ctx, { filename: pad });

/** De gegevens van de pagina in een taal: { NL, BR, V, niveaus: { a: {nr: versie}, b, c }, boek } */
export function laadTaal(pub = "public", taal = "en") {
  const html = readFileSync(join(pub, "bijbelreis.html"), "utf8");
  const nodig = /^(plaatsen|personen|inhoud\/|geschiedenissen\/|indeling|dateringen|niveaus|verwijzing)/;
  const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => nodig.test(s));
  // Eerst de Nederlandse gegevens (ter vergelijking), dan de taal.
  const nl = { window: {} };
  for (const s of scripts) run(nl, join(pub, "bijbelreis", s));
  const ctx = { window: {} };
  run(ctx, join(pub, "bijbelreis", "taal", taal + ".js"));
  const boek = ctx.window.BR.taalBoek[taal];
  ctx.window.BR.taal = { code: taal, t: (x) => x };
  const zonder = (boek.zonder || []).map((p) => new RegExp("^" + p.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"));
  for (const s of scripts.filter((s) => !zonder.some((re) => re.test(s)))) run(ctx, join(pub, "bijbelreis", s));
  for (const f of boek.inhoud || ["inhoud.js"]) run(ctx, join(pub, "bijbelreis", "taal", taal, f));
  run(ctx, join(pub, "bijbelreis", "taal", "laag.js"));
  const BR = ctx.window.BR;
  // De teksten per niveau van deze taal (lazy geladen in de browser).
  BR.niveaus.verhalen = {};
  const niveaus = { a: {}, b: {}, c: {} };
  for (const n of ["a", "b", "c"]) {
    const pad = join(pub, "bijbelreis", "taal", taal, "niveaus", n + ".js");
    if (!existsSync(pad)) continue;
    const c2 = { window: { BR: { niveaus: { voegToe: (k, v) => Object.assign(niveaus[k], v) } } } };
    run(c2, pad);
  }
  return { NL: nl.window.BR, BR, V: BR.vertaling[taal], niveaus, boek };
}

// ---------- taalheuristiek ----------
const STERK = /\b(het|een|niet|naar|geen|wordt|worden|heeft|hebben|zijn|deze|HEERE|Heere|Jezus|Mozes|Bijbel|geschiedenis|geschiedenissen|verhaal|verhalen|stappen|jouw|wij|zij|hij)\b/;
const ZWAK = /\b(de|en(?![-‐])|van|voor|ook|nog|dit|wat|wie|hoe|waar|bij|uit|tot|maar|om|aan|als|op|je|jij|ze|kies|tik|lees|stap|reis|kaart|jaar|dagen|keer|gaat|komt|zegt)\b/g;
/** Ziet een tekst er Nederlands uit? (Eén sterk woord, of twee gewone Nederlandse woorden.) */
export function nederlands(s) {
  const t = String(s || "");
  if (STERK.test(t)) return true;
  return (t.match(ZWAK) || []).length >= 2;
}

// Alle tekst in een waarde (string, lijst of object), met het pad erbij; sleutels zoals id/ref/why en kleuren tellen niet.
const GEEN_TEKST = new Set(["id", "ref", "why", "refs", "stap", "stappen", "plaatsen", "c", "w", "v", "s", "r", "at", "ll", "p", "kw", "status", "soort", "vorm", "sectie", "tl", "init", "loose", "zoom", "view", "bij", "nr", "fs", "ctx", "key", "i", "deel", "boek", "km", "pts", "cum", "len", "line", "casing", "arrows", "verdiep", "hoofd", "nogNiet", "rays4", "kings", "z", "t_", "sterren"]);
function teksten(x, pad, uit) {
  if (typeof x === "string") uit.push([pad, x]);
  else if (Array.isArray(x)) x.forEach((y, i) => teksten(y, `${pad}[${i}]`, uit));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (!GEEN_TEKST.has(k)) teksten(v, `${pad}.${k}`, uit);
  return uit;
}

/** Alle controles; geeft { fouten: [], aantallen: {} }. */
export function controleer(pub = "public", taal = "en") {
  const { NL, BR, V, niveaus } = laadTaal(pub, taal);
  const fouten = [];
  const fout = (m) => fouten.push(m);
  // ---------- sleutels ----------
  const nlStap = new Set(), nlDeel = new Set();
  NL.boeken.forEach((b) => b.delen.forEach((d) => { nlDeel.add(b.id + ":" + d.id); d.steps.forEach((s, i) => nlStap.add(b.id + ":" + d.id + ":" + i)); }));
  for (const k of Object.keys(V.delen || {})) if (!nlDeel.has(k)) fout(`deel bestaat niet in het Nederlands: ${k}`);
  for (const k of Object.keys(V.stappen || {})) if (!nlStap.has(k)) fout(`stap bestaat niet in het Nederlands: ${k}`);
  const nlNr = new Set(NL.geschiedenissen.map((g) => g.nr));
  const enStap = new Map();
  BR.boeken.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => enStap.set(b.id + ":" + d.id + ":" + i, s))));
  for (const nr of Object.keys(V.geschiedenissen || {}).map(Number)) {
    if (!nlNr.has(nr)) fout(`geschiedenis ${nr} bestaat niet in het Nederlands`);
    const g = BR.geschiedenissen.find((x) => x.nr === nr);
    if (!g) { fout(`geschiedenis ${nr} staat niet in de taal (ontbrekende stap?)`); continue; }
    for (const k of g.stappen) { const s = enStap.get(k); if (!s || s.nogNiet) fout(`geschiedenis ${nr}: stap ${k} is niet helemaal vertaald`); }
    for (const n of ["a", "b", "c"]) {
      const v = niveaus[n][nr];
      if (!v) { fout(`geschiedenis ${nr}: niveau ${n} ontbreekt`); continue; }
      if (v.status !== "concept") fout(`geschiedenis ${nr} niveau ${n}: status moet ‘concept’ zijn tot een mens heeft nagelezen`);
      const nlv = NL.niveaus.verhalen && NL.niveaus.verhalen[nr] && NL.niveaus.verhalen[nr][n];
      for (const d of v.delen || []) if (d.stap && !enStap.has(d.stap)) fout(`geschiedenis ${nr} niveau ${n}: stap ${d.stap} bestaat niet`);
      if (n !== "c" && (v.delen || []).length === 0) fout(`geschiedenis ${nr} niveau ${n}: geen tekst`);
      if (nlv && (nlv.vragen || []).length !== (v.vragen || []).length) fout(`geschiedenis ${nr} niveau ${n}: ${(v.vragen || []).length} vragen, het Nederlands heeft er ${(nlv.vragen || []).length}`);
      if (nlv && n !== "c" && (nlv.delen || []).length !== (v.delen || []).length) fout(`geschiedenis ${nr} niveau ${n}: ${(v.delen || []).length} delen, het Nederlands heeft er ${(nlv.delen || []).length}`);
      for (const q of v.vragen || []) if ((q.a || []).length !== (n === "a" ? 2 : 3)) fout(`geschiedenis ${nr} niveau ${n}: vraag met ${(q.a || []).length} antwoorden: ${q.q}`);
    }
    if (g.status !== "concept") fout(`geschiedenis ${nr}: status moet ‘concept’ zijn`);
  }
  for (const n of ["a", "b", "c"]) for (const nr of Object.keys(niveaus[n])) if (!V.geschiedenissen[nr]) fout(`niveau ${n}: geschiedenis ${nr} zonder basistekst`);

  // ---------- wat er in de taal te zien is ----------
  const items = []; // [pad, waarde, eigen verwijzingen]
  const gNrs = new Set(BR.geschiedenissen.map((g) => g.nr));
  BR.geschiedenissen.forEach((g) => {
    items.push([`v${g.nr}`, g, [g.ref]]);
    for (const n of ["a", "b", "c"]) if (niveaus[n][g.nr]) items.push([`v${g.nr}.${n}`, niveaus[n][g.nr], [g.ref]]);
    if (BR.indeling[g.nr]) items.push([`v${g.nr}.indeling`, BR.indeling[g.nr].map((x) => x.slice(0, 2)), [g.ref]]);
  });
  Object.entries(BR.kernwoorden || {}).forEach(([k, w]) => items.push([`kw.${k}`, w, []]));
  BR.boeken.forEach((b) => {
    items.push([`boek.${b.id}`, { n: b.n, tijd: b.tijd, intro: b.intro, wie: b.wie, ordAlles: b.ordAlles }, []]);
    b.delen.forEach((d) => {
      items.push([`${b.id}:${d.id}`, { n: d.n, short: d.short, intro: d.intro, stat: d.stat, cross: d.cross, tijd: d.tijd, tijdNoot: d.tijdNoot, who: d.who, quiz: d.quiz, trips: (d.trips || []).map((t) => t.n), denk: d.denk }, [d.ref]]);
      d.steps.forEach((s, i) => items.push([`${b.id}:${d.id}:${i}`, { t: s.t, stamp: s.stamp, txt: s.txt, fact: s.fact, who: s.who, onthul: s.onthul, vergelijk: s.vergelijk, look: s.look && s.look[2], later: s.later && s.later.lab }, [s.ref]]));
    });
  });
  Object.entries(BR.plaatsen).forEach(([id, p]) => items.push([`plaats.${id}`, { n: p.n, d: p.d, nu: p.nu, bron: p.bron, alt: (p.alt || []).map((a) => a[2]) }, []]));
  Object.entries(BR.mensen || {}).forEach(([id, m]) => items.push([`mens.${id}`, { n: m.n, alias: m.alias, kort: m.kort, elders: m.elders, vervolg: m.vervolg, leeftijd: m.leeftijd, ook: m.ook, basis: m.basis, overlevering: m.overlevering }, []]));
  items.push(["niveaus", BR.niveaus.soorten, []], ["dateringen", BR.dateringen.soorten, []]);

  // Nederlands?
  const MAG = /^(Kh\.|Tell?|Tall|Jebel|Har|Wadi|Ain|el-|Beit|Khirbet|Jezirat)/; // namen van vindplaatsen in hun eigen taal
  for (const [pad, w] of items) for (const [p, t] of teksten(w, pad, [])) {
    if (MAG.test(t)) continue;
    // ‘(onzeker)’ en ‘(ruwe schatting)’ in een jaartal zijn merktekens die app.js leest en nooit toont (datering).
    if (/\.tijd$/.test(p) && nederlandseWoorden(t.replace(/\s*\((onzeker|ruwe schatting|reconstructie)\)/g, ""), join(pub, "..")).length === 0 && !nederlands(t.replace(/\s*\((onzeker|ruwe schatting|reconstructie)\)/g, ""))) continue;
    const nlw = nederlandseWoorden(t, join(pub, ".."));
    if (nederlands(t) || nlw.length) fout(`Nederlands? ${p}: ${t.slice(0, 120)}${nlw.length ? ` [${nlw.join(", ")}]` : ""}`);
  }

  // Verwijzingen: alle velden ref, why, refs, en [ref, tekst]-paren (cross, elders, vervolg, kernwoord), leeftijd.
  const refs = [];
  const zoekRefs = (x, pad) => {
    if (Array.isArray(x)) {
      if (x.length >= 2 && typeof x[0] === "string" && typeof x[1] === "string" && leesRef(x[0]) !== null && /\d/.test(x[0]) && /^[1-3]?\s?[A-Z]/.test(x[0])) refs.push([pad, x[0]]);
      x.forEach((y, i) => zoekRefs(y, `${pad}[${i}]`));
    } else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
      if ((k === "ref" || k === "why") && typeof v === "string" && v) refs.push([`${pad}.${k}`, v]);
      else if (k === "refs" && Array.isArray(v)) v.forEach((r, i) => (typeof r === "string" ? refs.push([`${pad}.refs[${i}]`, r]) : zoekRefs(r, `${pad}.refs[${i}]`)));
      else zoekRefs(v, `${pad}.${k}`);
    }
  };
  for (const [pad, w, eigen] of items) { zoekRefs(w, pad); eigen.filter(Boolean).forEach((r) => refs.push([pad + "(ref)", r])); }
  for (const [pad, r] of refs) { const f = refFout(r); if (f) fout(`verwijzing ${pad}: ${f}`); }

  // Citaten
  let nCitaat = 0;
  const boekVan = (r) => { const q = r && leesRef(r); return q ? q[0].boek : null; };
  for (const [pad, w, eigen] of items) {
    // Per object: de eigen verwijzing(en), de why/refs van dat object en alles wat in de tekst genoemd wordt.
    const loop = (x, p, mee) => {
      if (typeof x === "string") {
        for (const c of citaten(x)) {
          nCitaat++;
          // De verzen van de eigen verwijzing en wat in de tekst genoemd wordt; daarna de hele hoofdstukken van de eigen
          // verwijzing (een citaat uit de aanloop van een geschiedenis, zoals Lukas 15:2 bij Lukas 15:11–32).
          const hoofdstuk = (r) => (leesRef(r) || []).map((q) => `${q.boek} ${q.c1}${q.c2 !== q.c1 ? "–" + q.c2 : ""}`);
          const kandidaat = [...new Set(mee.concat(refsIn(x, boekVan(mee[0])), mee.flatMap(hoofdstuk)))].filter((r) => leesRef(r));
          if (!citaatKlopt(c, kandidaat)) fout(`citaat niet letterlijk in de KJV (${kandidaat.join("; ") || "geen verwijzing"}): ${p}: ‘${c}’`);
        }
      } else if (Array.isArray(x)) {
        const eigenRef = x.length >= 2 ? x.filter((y) => typeof y === "string" && /^[1-3]?\s?[A-Z][a-z]+(?: [a-z]+ [A-Z][a-z]+)? \d/.test(y) && leesRef(y)) : [];
        x.forEach((y, i) => loop(y, `${p}[${i}]`, mee.concat(eigenRef)));
      } else if (x && typeof x === "object") {
        const extra = [x.ref, x.why, ...(x.refs || []).map((r) => (Array.isArray(r) ? r[0] : r))].filter((r) => typeof r === "string" && leesRef(r));
        for (const [k, v] of Object.entries(x)) if (!GEEN_TEKST.has(k)) loop(v, `${p}.${k}`, mee.concat(extra));
      }
    };
    loop(w, pad, eigen.filter(Boolean));
  }
  return { fouten, aantallen: { geschiedenissen: gNrs.size, delen: BR.boeken.reduce((a, b) => a + b.delen.length, 0), stappenVolledig: [...enStap.values()].filter((s) => !s.nogNiet).length, verwijzingen: refs.length, citaten: nCitaat, plaatsen: Object.keys(BR.plaatsen).length, personen: Object.keys(BR.mensen).length } };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const taal = process.argv[2] || "en";
  const { fouten, aantallen } = controleer("public", taal);
  console.log(JSON.stringify(aantallen));
  for (const f of fouten) console.log("FOUT " + f);
  console.log(`${fouten.length} fouten`);
  process.exitCode = fouten.length ? 1 : 0;
}
