// Gegevenscontrole van de Bijbelreis (public/bijbelreis): verwijzingen, plaatsen, personen en de stapsleutels
// waaraan de voortgang van kinderen (stempels in localStorage) hangt.
import { readFileSync, existsSync } from "node:fs";
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
const scripts = [...html.matchAll(/src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
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
      expect(p.ll[0] > 10 && p.ll[0] < 46 && p.ll[1] > 18 && p.ll[1] < 60, id).toBe(true);
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
    for (const { d } of DELEN) if (d.tl) { expect(d.tl[0] <= d.tl[1], d.id).toBe(true); expect(d.tl[0] < 0, d.id).toBe(true); }
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
});
