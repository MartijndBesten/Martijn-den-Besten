// Gegevenscontrole van de Bijbelreis (public/bijbelreis): verwijzingen, plaatsen, personen en de stapsleutels
// waaraan de voortgang van kinderen (stempels in localStorage) hangt.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type Route = { p: (string | [number, number])[]; recon?: number; w?: string };
type Step = { ref: string; t: string; stamp: string; txt: string; at?: string[]; r?: Route[]; who?: [string, string?][]; fact?: string; fs?: string; later?: { p: (string | [number, number])[] }; look?: string[]; rays4?: string };
type Deel = { id: string; n: string; ref: string; c: string; steps: Step[]; cross?: [string, string][]; ctx?: string[]; tijd?: string | null; tl?: [number, number] | null; quiz?: { tap?: { id: string }[]; mc?: { a: string[]; why: string }[]; ord?: { items: string[] }[] } };
type Boek = { id: string; n: string; delen: Deel[] };
type Plaats = { n: string; ll: [number, number]; c?: string; ctx?: number; alt?: [number, number, string?][] };
type Mens = { n: string; v?: string; m?: string; p?: string[]; boek?: string[] };
type BR = { boeken: Boek[]; plaatsen: Record<string, Plaats>; W: Record<string, [number, number]>; personen: Record<string, string>; mensen?: Record<string, Mens> };

const PUB = join(__dirname, "..", "public");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
// De teksten per reisniveau laadt de pagina zelf na (niveaus.js); hier gewoon alle drie.
const scripts = [...html.matchAll(/src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s)).concat(["niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]);
const ctx: { window: { BR?: BR } } = { window: {} };
for (const s of scripts) {
  const src = readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR.");
  runInNewContext(src, ctx);
}
const BR = ctx.window.BR as BR;
const P = BR.plaatsen, W = BR.W;
const DELEN = BR.boeken.flatMap((b) => b.delen.map((d) => ({ b, d })));
const STEPS = DELEN.flatMap(({ b, d }) => d.steps.map((s, i) => ({ b, d, s, i, key: `${b.id}:${d.id}:${i}` })));

// Bijbelverwijzing → bestaat ze in de Statenvertaling (public/bijbelreis/bijbel/<slug>.json)? Zelfde lezer als de app.
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };
const parseRef = (BR as unknown as { parseRef: (r: string) => { ranges: Range[] } | null }).parseRef;
const bible: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function verses(ref: string): string {
  const q = parseRef(ref);
  if (!q) return "onleesbaar";
  for (const rg of q.ranges) {
    const file = join(PUB, "bijbelreis", "bijbel", rg.slug + ".json");
    if (!existsSync(file)) continue; // boek niet aanwezig: niet te controleren
    bible[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bible[rg.slug].hoofdstukken, n = Object.keys(H).length;
    const c2 = rg.c2 === 999 ? n : rg.c2;
    if (!H[rg.c1]) return `hoofdstuk ${rg.c1} bestaat niet`;
    if (!H[c2]) return `hoofdstuk ${c2} bestaat niet`;
    if (rg.v1 > H[rg.c1].length) return `${rg.c1}:${rg.v1} bestaat niet`;
    if (rg.v2 !== 999 && rg.v2 > H[c2].length) return `${c2}:${rg.v2} bestaat niet`;
    if (c2 === rg.c1 && rg.v2 < rg.v1) return "omgekeerd bereik";
  }
  return "ok";
}

describe("bijbelreis: inhoud laadt", () => {
  it("heeft boeken, delen en stappen", () => {
    expect(BR.boeken.length).toBeGreaterThanOrEqual(14);
    expect(STEPS.length).toBeGreaterThanOrEqual(252);
  });
  it("elke stap heeft ref, titel, stempel en tekst", () => {
    for (const { key, s } of STEPS) {
      expect(s.ref, key).toBeTruthy();
      expect(s.t, key).toBeTruthy();
      expect(s.stamp, key).toBeTruthy();
      expect(s.txt && s.txt.length > 40, key).toBe(true);
      if (s.fs) expect(["b", "u", "h"], key).toContain(s.fs);
    }
  });
});

describe("bijbelreis: voortgang blijft bewaard", () => {
  const snap: Record<string, string> = JSON.parse(readFileSync(join(__dirname, "bijbelreis-stappen.json"), "utf8"));
  it("alle stapsleutels van de vorige versie bestaan nog (stempels in localStorage)", () => {
    const keys = new Set(STEPS.map((x) => x.key));
    const lost = Object.keys(snap).filter((k) => !keys.has(k));
    expect(lost).toEqual([]);
  });
  it("deel- en boek-ids zijn uniek", () => {
    const ids = DELEN.map(({ d }) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("bijbelreis: plaatsen en routes", () => {
  it("elke route, plek en contextplaats bestaat", () => {
    const miss: string[] = [];
    const chk = (k: string | [number, number], where: string) => { if (typeof k === "string" && !P[k] && !W[k]) miss.push(`${where}: ${k}`); };
    for (const { key, s, d } of STEPS) {
      (s.at || []).forEach((k) => { if (!P[k]) miss.push(`${key} at: ${k}`); });
      (s.r || []).forEach((r) => r.p.forEach((k) => chk(k, key)));
      (s.later?.p || []).forEach((k) => chk(k, key + " later"));
      (s.look || []).slice(0, 2).forEach((k) => chk(k, key + " look"));
      if (s.rays4) chk(s.rays4, key + " rays4");
      (d.ctx || []).forEach((k) => { if (!P[k]) miss.push(`${d.id} ctx: ${k}`); });
      (d.quiz?.tap || []).forEach((q) => { if (!P[q.id] && !W[q.id]) miss.push(`${d.id} tap: ${q.id}`); });
    }
    expect(miss).toEqual([]);
  });
  it("tussenpunten en plaatsen gebruiken nooit dezelfde sleutel", () => {
    expect(Object.keys(W).filter((k) => P[k])).toEqual([]);
  });
  it("coördinaten liggen in het kaartgebied en zekerheid is ingevuld", () => {
    for (const [id, p] of Object.entries(P)) {
      expect(p.ll[0] > 10 && p.ll[0] < 47 && p.ll[1] > 4 && p.ll[1] < 60, id).toBe(true); // kaartgebied van Rome tot Perzië
      if (!p.ctx) expect(["v", "w", "b", "o", "r"], id).toContain(p.c);
      if (p.c === "b") expect(Array.isArray(p.alt) && p.alt.length > 0, `${id}: betwist zonder kandidaten`).toBe(true);
    }
  });
  it("Eden en Ararat staan nooit als exacte plek", () => {
    expect(["o", "r"]).toContain(P.eden.c);
    expect(["o", "r"]).toContain(P.ararat.c);
  });
});

describe("bijbelreis: Bijbelverwijzingen bestaan in de Statenvertaling", () => {
  it("refs van stappen, delen en kruisverwijzingen", () => {
    const bad: string[] = [];
    const t = (ref: string, where: string) => { const r = verses(ref); if (r !== "ok") bad.push(`${where}: ${ref} (${r})`); };
    for (const { key, s } of STEPS) t(s.ref, key);
    for (const { d } of DELEN) { t(d.ref, d.id); (d.cross || []).forEach(([r]) => t(r, d.id + " cross")); (d.quiz?.mc || []).forEach((q) => q.why && /\d/.test(q.why) && t(q.why.replace(/^.*?(\d?\s?[A-Z][a-zëéïü]+ \d.*)$/, "$1"), d.id + " mc")); }
    expect(bad).toEqual([]);
  });
});

describe("bijbelreis: speurtocht", () => {
  it("meerkeuzevragen hebben unieke antwoorden en een verwijzing; volgordevragen minstens 3 items", () => {
    for (const { d } of DELEN) {
      (d.quiz?.mc || []).forEach((q, i) => { expect(new Set(q.a).size, `${d.id} mc ${i}`).toBe(q.a.length); expect(q.a.length, `${d.id} mc ${i}`).toBeGreaterThanOrEqual(2); expect(q.why, `${d.id} mc ${i}`).toBeTruthy(); });
      (d.quiz?.ord || []).forEach((q, i) => expect(q.items.length, `${d.id} ord ${i}`).toBeGreaterThanOrEqual(3));
    }
  });
});

describe("bijbelreis: chronologie", () => {
  it("Genesis 1–11 heeft geen jaartal; datums zijn oplopende getallen", () => {
    const begin = DELEN.find(({ d }) => d.id === "begin")!.d;
    expect(begin.tl ?? null).toBeNull();
    for (const { b, d } of DELEN) if (d.tl) { expect(d.tl[0] <= d.tl[1], d.id).toBe(true); if (!(b as unknown as { nt?: boolean }).nt) expect(d.tl[0] < 0, d.id).toBe(true); }
  });
});

describe("bijbelreis: personen", () => {
  const M = BR.mensen;
  it.skipIf(!M)("ouders en partners verwijzen naar bestaande personen, zonder kringen", () => {
    const bad: string[] = [];
    for (const [id, m] of Object.entries(M!)) {
      [m.v, m.m, ...(m.p || [])].filter(Boolean).forEach((x) => { if (!M![x!]) bad.push(`${id} → ${x}`); });
      let cur: string | undefined = m.v, n = 0;
      while (cur && n < 200) { if (cur === id) { bad.push(`kring bij ${id}`); break; } cur = M![cur]?.v; n++; }
    }
    expect(bad).toEqual([]);
  });
  it.skipIf(!M)("elke familieband heeft een grondslag: uit de Bijbel (b) of afgeleid (a, met redenering), met een bestaande tekst", () => {
    type G = [string, string, string?];
    const bad: string[] = [];
    const check = (wie: string, g: G | undefined) => {
      if (!g) return bad.push(`${wie}: geen grondslag`);
      if (!["b", "a"].includes(g[0])) bad.push(`${wie}: soort ${g[0]}`);
      if (verses(g[1]) !== "ok") bad.push(`${wie}: ${g[1]} ${verses(g[1])}`);
      if (g[0] === "a" && !(g[2] && g[2].length > 10)) bad.push(`${wie}: afgeleid zonder redenering`);
    };
    for (const [id, m] of Object.entries(M!)) {
      const b = (m as { basis?: { v?: G; m?: G; p?: Record<string, G> } }).basis || {};
      if (m.v) check(`${id} → vader ${m.v}`, b.v);
      if (m.m) check(`${id} → moeder ${m.m}`, b.m);
      (m.p || []).forEach((k) => check(`${id} → partner ${k}`, (b.p || {})[k] || ((M![k] as { basis?: { p?: Record<string, G> } }).basis?.p || {})[id]));
      const o = (m as { overlevering?: [string, string?][] }).overlevering;
      if (o && !o.every((x) => Array.isArray(x) && x[0])) bad.push(`${id}: overlevering zonder tekst`);
    }
    expect(bad).toEqual([]);
  });
  it.skipIf(!M)("personen met dezelfde naam delen nooit een boek (de app zou ze dan samenvoegen)", () => {
    const seen: Record<string, string> = {}, bad: string[] = [];
    for (const [id, m] of Object.entries(M!)) {
      for (const n of [m.n].concat((m as { alias?: string[] }).alias || []))
        for (const b of m.boek || []) { const k = `${b}|${n}`; if (seen[k] && seen[k] !== id) bad.push(`${k}: ${seen[k]} en ${id}`); seen[k] = id; }
    }
    expect(bad).toEqual([]);
  });
});

// ---------- de 150 geschiedenissen ----------
type Gesch = { nr: number; t: string; ref: string; stappen: string[]; vorm: string; uitleg: string; betekenis?: string; wie?: string[]; kw?: string;
  ontdek?: { soort: string }; quiz: { q: string; a: string[]; why: string }[]; cross?: [string, string][]; tl?: [number, number] | null };
const GS = ((BR as unknown as { geschiedenissen?: Gesch[] }).geschiedenissen || []).slice().sort((a, b) => a.nr - b.nr);
const KWS = (BR as unknown as { kernwoorden?: Record<string, { n: string; uitleg: string; refs?: [string, string][] }> }).kernwoorden || {};
const LEID = readFileSync(join(__dirname, "..", "docs", "bijbelreis-150", "inhoudsopgave.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const STAPKEYS = new Set(STEPS.map((x) => x.key));
const KWID = (n: string) => n.toLowerCase().replace(/^de /, "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");

describe("bijbelreis: de 150 geschiedenissen", () => {
  it("de leidraad heeft 150 unieke nummers (79 OT, 71 NT) en 47 kernwoorden", () => {
    expect(LEID.map((r) => +r[0])).toEqual(Array.from({ length: 150 }, (_, i) => i + 1));
    expect(LEID.filter((r) => r[3]).length).toBe(47);
  });
  it("elk record is volledig en verwijst naar bestaande stappen, teksten en kernwoorden", () => {
    const bad: string[] = [];
    const nrs = new Set<number>();
    for (const g of GS) {
      const w = `#${g.nr}`;
      if (nrs.has(g.nr)) bad.push(`${w} dubbel`); nrs.add(g.nr);
      if (!(g.nr >= 1 && g.nr <= 150)) bad.push(`${w} nummer`);
      if (!g.t || !g.ref) bad.push(`${w} titel/ref`);
      if (verses(g.ref) !== "ok" && !/^Zacharia en Maleachi$/.test(g.ref)) bad.push(`${w} ref ${g.ref}: ${verses(g.ref)}`);
      if (!g.uitleg || g.uitleg.length < 200) bad.push(`${w} uitleg te kort`);
      if (!["route", "plek", "stamboom", "gelijkenis", "thema", "symbool"].includes(g.vorm)) bad.push(`${w} vorm ${g.vorm}`);
      (g.stappen || []).forEach((k) => { if (!STAPKEYS.has(k)) bad.push(`${w} stap ${k} bestaat niet`); });
      if (!(g.stappen || []).length && !["symbool", "thema"].includes(g.vorm)) bad.push(`${w} geen stappen`);
      if (!g.quiz || g.quiz.length < 3 || g.quiz.length > 5) bad.push(`${w} ${g.quiz ? g.quiz.length : 0} vragen`);
      (g.quiz || []).forEach((q, i) => {
        if (new Set(q.a).size !== q.a.length || q.a.length < 2) bad.push(`${w} vraag ${i + 1} antwoorden`);
        if (!q.why || verses(q.why.replace(/^.*?(\d?\s?[A-Z][a-zëéïü]+ \d.*)$/, "$1")) !== "ok") bad.push(`${w} vraag ${i + 1} why ${q.why}`);
      });
      (g.cross || []).forEach(([r]) => { if (verses(r) !== "ok") bad.push(`${w} cross ${r}`); });
      if (!g.ontdek || !["koppel", "volgorde", "onthul", "wiezei", "gelijkenis", "symbolen", "verbanden", "kaart", "stamboom"].includes(g.ontdek.soort)) bad.push(`${w} ontdek`);
      const lk = LEID.find((r) => +r[0] === g.nr)!;
      if (lk[3] && g.kw !== KWID(lk[3])) bad.push(`${w} kernwoord moet ${KWID(lk[3])} zijn (is ${g.kw})`);
      if (!lk[3] && g.kw) bad.push(`${w} heeft een kernwoord dat niet in de leidraad staat`);
      if (g.kw && !KWS[g.kw]) bad.push(`${w} kernwoord ${g.kw} ontbreekt in BR.kernwoorden`);
    }
    expect(bad).toEqual([]);
  });
  it("elke geschiedenis is inhoudelijk uitgewerkt, niet alleen een record", () => {
    type O = { soort: string; id?: string; items?: unknown[][]; paren?: string[][]; rijen?: unknown[][]; beelden?: string[][] };
    const MIN: Record<string, number> = { koppel: 3, volgorde: 3, onthul: 3, wiezei: 2, gelijkenis: 3, symbolen: 3, verbanden: 2, stamboom: 2 };
    const bad: string[] = [];
    for (const g of GS) {
      const w = `#${g.nr}`, o = g.ontdek as O;
      if (g.uitleg.length < 400) bad.push(`${w} uitleg korter dan 400 tekens`);
      if (!g.betekenis || g.betekenis.length < 100) bad.push(`${w} betekenis ontbreekt of te kort`);
      if (!(g.cross || []).length) bad.push(`${w} geen verwijzingen elders in de Bijbel`);
      g.quiz.forEach((q, i) => { if (q.a.length < 3) bad.push(`${w} vraag ${i + 1} minder dan 3 antwoorden`); });
      if (o.soort === "kaart") { if (!o.id || !P[o.id]) bad.push(`${w} kaart-ontdekking zonder bestaande plaats`); continue; }
      const list = (o.items || o.paren || o.rijen || o.beelden || []) as unknown[][];
      if (list.length < MIN[o.soort]) bad.push(`${w} ${o.soort}: ${list.length} onderdelen`);
      if (o.soort === "wiezei") list.forEach((it) => { if (!it[0] || !it[1] || !(it[2] as string[] || []).length) bad.push(`${w} wiezei zonder citaat/antwoord/alternatief`); });
      if (["gelijkenis", "symbolen", "koppel"].includes(o.soort)) list.forEach((it) => { if (!it[0] || !it[1]) bad.push(`${w} ${o.soort} zonder uitleg`); });
      if (o.soort === "verbanden") list.forEach((it) => [it[0], it[2]].forEach((r) => { if (verses(r as string) !== "ok") bad.push(`${w} verband ${r}`); }));
    }
    expect(bad).toEqual([]);
  });
  it("geen dubbele uitleg of dubbele vragen tussen geschiedenissen", () => {
    const u = GS.map((g) => g.uitleg), q = GS.flatMap((g) => g.quiz.map((x) => x.q.toLowerCase()));
    expect(u.filter((x, i) => u.indexOf(x) !== i)).toEqual([]);
    expect(q.filter((x, i) => q.indexOf(x) !== i)).toEqual([]);
  });
  it("kernwoorden hebben uitleg en kloppende verwijzingen", () => {
    const bad: string[] = [];
    for (const [id, k] of Object.entries(KWS)) {
      if (!k.n || !k.uitleg || k.uitleg.length < 80) bad.push(`${id} uitleg`);
      (k.refs || []).forEach(([r]) => { if (verses(r) !== "ok") bad.push(`${id} ${r}`); });
    }
    expect(bad).toEqual([]);
  });
  it.skipIf(process.env.BIJBELREIS_150 !== "1")("alle 150 geschiedenissen zijn uitgewerkt (BIJBELREIS_150=1)", () => {
    expect(GS.map((g) => g.nr)).toEqual(Array.from({ length: 150 }, (_, i) => i + 1));
    expect(Object.keys(KWS).length).toBe(47);
  });
});

// Leeservaring: de vertelling is in onderdelen met een tussenkop verdeeld (indeling.js), zonder dat er tekst verloren gaat.
describe("bijbelreis: indeling van de vertelteksten", () => {
  const IND = (BR as unknown as { indeling?: Record<number, [string, string, string?][]> }).indeling || {};
  it("elke geschiedenis heeft 2–4 onderdelen met een rustige kop", () => {
    const bad: string[] = [];
    for (const g of GS) {
      const d = IND[g.nr];
      if (!d || d.length < 2 || d.length > 4) { bad.push(`#${g.nr} aantal`); continue; }
      for (const [kop] of d) if (!kop || kop.length > 42 || /[!?.]$/.test(kop) || kop.split(/\s+/).length < 2) bad.push(`#${g.nr} kop '${kop}'`);
    }
    expect(bad).toEqual([]);
  });
  it("elk onderdeel begint letterlijk aan het begin van een zin en samen vormen ze precies de hele tekst", () => {
    const bad: string[] = [];
    for (const g of GS) {
      const d = IND[g.nr]; if (!d) continue;
      if (d[0][1] !== "") bad.push(`#${g.nr} eerste onderdeel begint niet aan het begin`);
      const at = d.map(([, b], i) => (i === 0 ? 0 : g.uitleg.indexOf(b)));
      at.forEach((x, i) => {
        if (i === 0) return;
        if (x < 0) bad.push(`#${g.nr} begin '${d[i][1]}' niet gevonden`);
        else if (g.uitleg.indexOf(d[i][1], x + 1) >= 0) bad.push(`#${g.nr} begin '${d[i][1]}' niet uniek`);
        else if (!/[.!?…][’”')]*\s+$/.test(g.uitleg.slice(0, x))) bad.push(`#${g.nr} begin '${d[i][1]}' niet op een zinsgrens`);
        if (x <= at[i - 1]) bad.push(`#${g.nr} volgorde`);
      });
      const delen = at.map((x, i) => g.uitleg.slice(x, at[i + 1] ?? g.uitleg.length).trim());
      if (delen.join(" ") !== g.uitleg.trim().replace(/\s+/g, " ")) bad.push(`#${g.nr} tekst niet volledig`);
    }
    expect(bad).toEqual([]);
  });
  it("een ontdekmoment verwijst naar een kaartstap van dezelfde geschiedenis", () => {
    const bad: string[] = [];
    for (const g of GS) for (const [, , stap] of IND[g.nr] || []) if (stap && !g.stappen.includes(stap)) bad.push(`#${g.nr} ${stap}`);
    expect(bad).toEqual([]);
  });
});

// Dateringen: bij elk jaartal staat waarop het rust (dateringen.js); vroege data zijn nooit als vaststaand feit gemarkeerd.
describe("bijbelreis: grond van de jaartallen", () => {
  const DAT = (BR as unknown as { dateringen: { soorten: Record<string, { n: string; uitleg: string }>; delen: Record<string, [string, boolean]>; verhalen: [number, number, string, boolean][] } }).dateringen;
  const vanVerhaal = (nr: number) => DAT.verhalen.find(([a, b]) => nr >= a && nr <= b);
  it("elk gedateerd deel en elke gedateerde geschiedenis heeft een soort en een toelichting", () => {
    const bad: string[] = [];
    for (const { b, d } of DELEN) {
      const key = `${b.id}:${d.id}`;
      if (d.tijd == null) { if (DAT.delen[key]) bad.push(`${key} heeft geen jaartal maar wel een soort`); continue; }
      if (!DAT.delen[key] || !["bijbel", "historie"].includes(DAT.delen[key][0])) bad.push(`${key} zonder soort`);
      if (!(d as unknown as { tijdNoot?: string }).tijdNoot) bad.push(`${key} zonder toelichting`);
    }
    for (const g of GS as unknown as { nr: number; tijd?: string | null; tijdNoot?: string }[]) {
      if (g.tijd == null) continue;
      if (!vanVerhaal(g.nr)) bad.push(`#${g.nr} zonder soort`);
      if (!g.tijdNoot) bad.push(`#${g.nr} zonder toelichting`);
    }
    expect(bad).toEqual([]);
  });
  it("de reeksen overlappen niet en Genesis 1–11 heeft geen jaartal", () => {
    const n = DAT.verhalen.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i));
    expect(new Set(n).size).toBe(n.length);
    for (const g of GS as unknown as { nr: number; tijd?: string | null }[]) if (g.nr <= 7) expect(g.tijd ?? null, `#${g.nr}`).toBeNull();
  });
  it("uittocht, aartsvaders, richters en kruisiging zijn als onzeker gemarkeerd", () => {
    for (const key of ["genesis:abraham", "exodus:uittocht", "jozua:intocht", "richteren:debora", "jezus-3:nt-lijden"]) expect(DAT.delen[key]?.[1], key).toBe(true);
    for (const nr of [8, 26, 37, 42, 126]) expect(vanVerhaal(nr)?.[3], `#${nr}`).toBe(true);
    for (const nr of [8, 26, 42]) expect(vanVerhaal(nr)?.[2], `#${nr}`).toBe("bijbel");
  });
});

// Reisniveaus (proef): drie vertelversies per geschiedenis in niveaus.js. Inhoudelijke regels die een redacteur
// niet met de hand hoeft na te lopen: vorm, lengte, verwijzingen, antwoorden en letterlijke citaten.
describe("bijbelreis: reisniveaus", () => {
  type Deel = { t: string; kop?: string; stap?: string };
  type Vraag = { q: string; a: string[]; why: string };
  type Versie = { status: string; delen?: Deel[]; vragen?: Vraag[]; samen?: string; plaatsen?: string[]; verdieping?: { kop: string; t: string; refs?: string[] }[] };
  const NV = (BR as unknown as { niveaus: { soorten: Record<string, { n: string }>; verhalen: Record<number, Record<string, Versie>> } }).niveaus;
  const ALLE = Object.entries(NV.verhalen).flatMap(([nr, lv]) => Object.entries(lv).map(([n, v]) => ({ nr: +nr, n, v })));
  // De hele Statenvertaling als één genormaliseerde tekst, om citaten letterlijk terug te vinden.
  const norm = (t: string) => t.toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const SV = readdirSync(join(PUB, "bijbelreis", "bijbel")).filter((f) => f.endsWith(".json")).map((f) => Object.values((JSON.parse(readFileSync(join(PUB, "bijbelreis", "bijbel", f), "utf8")) as { hoofdstukken: Record<string, string[]> }).hoofdstukken).flat().join(" ")).map(norm).join(" ");
  const teksten = (v: Versie) => [...(v.delen || []).flatMap((d) => [d.t, d.kop || ""]), v.samen || "", ...(v.verdieping || []).flatMap((d) => [d.kop, d.t]), ...(v.vragen || []).flatMap((q) => [q.q, ...q.a])];

  it("drie voorbeeldgeschiedenissen (schepping, Schelfzee, geboorte) op alle drie niveaus, met een geldige status", () => {
    expect(Object.keys(NV.verhalen).map(Number).sort((a, b) => a - b)).toEqual([1, 26, 83]);
    for (const nr of [1, 26, 83]) expect(Object.keys(NV.verhalen[nr]).sort(), `#${nr}`).toEqual(["a", "b", "c"]);
    for (const { nr, n, v } of ALLE) expect(["concept", "goedgekeurd"], `#${nr}${n}`).toContain(v.status);
    expect(Object.keys(NV.soorten)).toEqual(["a", "b", "c"]);
  });
  it("Samen ontdekken: korte stappen, geen jaartallen, twee antwoorden per vraag en een tip voor wie voorleest", () => {
    const bad: string[] = [];
    for (const { nr, n, v } of ALLE.filter((x) => x.n === "a")) {
      const w = `#${nr}${n}`;
      if (!v.delen || v.delen.length < 4 || v.delen.length > 10) bad.push(`${w} aantal stappen`);
      for (const d of v.delen || []) {
        if (d.t.length > 140) bad.push(`${w} stap te lang (${d.t.length}): ${d.t.slice(0, 30)}`);
        if ((d.t.match(/[.!?](\s|$)/g) || []).length > 3) bad.push(`${w} te veel zinnen: ${d.t.slice(0, 30)}`);
        if (/\b\d{3,4}\b/.test(d.t)) bad.push(`${w} jaartal in stap`);
      }
      if (!v.samen) bad.push(`${w} tip voor wie voorleest ontbreekt`);
      if (!v.vragen || v.vragen.length < 2) bad.push(`${w} vragen`);
      for (const q of v.vragen || []) if (q.a.length !== 2) bad.push(`${w} ‘${q.q}’ heeft geen twee antwoorden`);
    }
    expect(bad).toEqual([]);
  });
  it("Zelf op reis: 2–4 onderdelen met kop, samen hooguit 1.000 tekens; vragen met drie antwoorden", () => {
    const bad: string[] = [];
    for (const { nr, n, v } of ALLE.filter((x) => x.n === "b")) {
      const w = `#${nr}${n}`, len = (v.delen || []).reduce((a, d) => a + d.t.length, 0), g = GS.find((x) => x.nr === nr)!;
      if (!v.delen || v.delen.length < 2 || v.delen.length > 4 || v.delen.some((d) => !d.kop)) bad.push(`${w} onderdelen`);
      if (len > 1000 || !g) bad.push(`${w} te lang (${len})`);
      for (const q of v.vragen || []) if (q.a.length !== 3) bad.push(`${w} ‘${q.q}’ heeft geen drie antwoorden`);
    }
    expect(bad).toEqual([]);
  });
  it("Verder ontdekken: verdieping met kop en tekst, verdiepende vragen met drie antwoorden", () => {
    const bad: string[] = [];
    for (const { nr, n, v } of ALLE.filter((x) => x.n === "c")) {
      if (!v.verdieping || v.verdieping.length < 2) bad.push(`#${nr}${n} verdieping`);
      for (const q of v.vragen || []) if (q.a.length !== 3) bad.push(`#${nr}${n} ‘${q.q}’`);
    }
    expect(bad).toEqual([]);
  });
  it("antwoorden zijn uniek, verwijzingen en kaartstappen bestaan, plaatsen horen bij de geschiedenis", () => {
    const bad: string[] = [];
    for (const { nr, n, v } of ALLE) {
      const w = `#${nr}${n}`, g = GS.find((x) => x.nr === nr)!;
      for (const q of v.vragen || []) {
        if (new Set(q.a).size !== q.a.length) bad.push(`${w} dubbel antwoord ‘${q.q}’`);
        for (const r of q.why.split(/;\s*/)) if (verses(r) !== "ok") bad.push(`${w} ${r}: ${verses(r)}`);
      }
      for (const d of v.verdieping || []) for (const r of d.refs || []) if (verses(r) !== "ok") bad.push(`${w} ${r}: ${verses(r)}`);
      for (const d of v.delen || []) if (d.stap && !g.stappen.includes(d.stap)) bad.push(`${w} stap ${d.stap}`);
      const plaatsenVanG = new Set(g.stappen.flatMap((k) => STEPS.find((s) => s.key === k)?.s.at || []).concat(g.stappen.flatMap((k) => (STEPS.find((s) => s.key === k)?.s.r || []).flatMap((r) => r.p.filter((x): x is string => typeof x === "string")))));
      for (const p of v.plaatsen || []) if (!P[p] || !plaatsenVanG.has(p)) bad.push(`${w} plaats ${p}`);
    }
    expect(bad).toEqual([]);
  });
  it("elk citaat tussen ‘ ’ staat letterlijk in de Statenvertaling", () => {
    const bad: string[] = [];
    for (const { nr, n, v } of ALLE) for (const t of teksten(v)) for (const m of t.matchAll(/‘([^’]+)’/g)) {
      for (const stuk of m[1].split(/…|\.\.\./)) if (norm(stuk) && !SV.includes(norm(stuk))) bad.push(`#${nr}${n}: ‘${stuk}’`);
    }
    expect(bad).toEqual([]);
  });
});
