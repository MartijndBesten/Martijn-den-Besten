// Lesroutes (/bijbelreis/lessen): de routes verwijzen alleen naar bestaande geschiedenissen en reisstappen, elke vraag
// heeft een Bijbelverwijzing die binnen het gedeelte valt dat je samen leest, en wat er als antwoord staat, is
// gecontroleerd tegen de Statenvertaling. Uitleg: docs/bijbelreis-samen/README.md. De pagina zelf: e2e/bijbelreis-samen.spec.ts.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { bijbelreisPagina } from "../shared/bijbelreis";

type Vraag = { q: string; ref: string; a: string };
type Les = { v: number; lees: string; vragen: Vraag[] };
type Route = { id: string; n: string; kort: string; bereik: string; extra?: { t: string; deel: string }; lessen: Les[] };
type Geschiedenis = { nr: number; t: string; ref: string; stappen: string[] };
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };
type BRt = {
  boeken: { id: string; delen: { id: string; steps: unknown[] }[] }[];
  geschiedenissen: Geschiedenis[];
  lessen: Route[];
  parseRef: (r: string) => { ranges: Range[] } | null;
};

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const SVDIR = join(ROOT, "data", "statenvertaling");
const scriptsVan = (pagina: string) => [...readFileSync(join(PUB, pagina), "utf8").matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]);
const atlasScripts = scriptsVan("bijbelreis.html");
const lessenScripts = scriptsVan("bijbelreis/lessen.html");

// Dezelfde gegevens als de atlas (zonder kaartmotor en app), plus de lesroutes.
const ctx: { window: { BR?: BRt } } = { window: {} };
for (const s of atlasScripts.filter((s) => !/^(leaflet|app)\.js$/.test(s)).concat(["lessen-data.js"])) {
  runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
}
const BR = ctx.window.BR as BRt;
const ROUTES = BR.lessen;
const G = new Map(BR.geschiedenissen.map((g) => [g.nr, g]));
const STAPPEN = new Set(BR.boeken.flatMap((b) => b.delen.flatMap((d) => d.steps.map((_, i) => `${b.id}:${d.id}:${i}`))));
const DELEN = new Set(BR.boeken.flatMap((b) => b.delen.map((d) => d.id)));
const LESSEN = ROUTES.flatMap((r) => r.lessen.map((l, i) => ({ r, l, naam: `${r.id} les ${i + 1}` })));
const VRAGEN = LESSEN.flatMap(({ l, naam }) => l.vragen.map((v, i) => ({ l, v, naam: `${naam} vraag ${i + 1}` })));

// De Statenvertaling (alleen voor controle; niet in de app): de tekst van een verwijzing, en het einde van een hoofdstuk.
const bijbel: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
const boek = (slug: string) => (bijbel[slug] ??= JSON.parse(readFileSync(join(SVDIR, slug + ".json"), "utf8")));
const bereiken = (ref: string) => {
  const q = BR.parseRef(ref);
  if (!q) throw new Error(`onleesbare verwijzing: ${ref}`);
  // Een open eind (hele hoofdstuk) wordt het laatste vers, zodat bereiken te vergelijken zijn.
  return q.ranges.map((rg) => {
    const H = boek(rg.slug).hoofdstukken, c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
    return { slug: rg.slug, van: rg.c1 * 1000 + rg.v1, tot: c2 * 1000 + (rg.v2 === 999 ? H[c2].length : rg.v2) };
  });
};
const binnen = (ref: string, groter: string) => {
  const b = bereiken(groter);
  return bereiken(ref).every((r) => b.some((x) => x.slug === r.slug && x.van <= r.van && r.tot <= x.tot));
};
const tekst = (ref: string) => {
  const uit: string[] = [];
  for (const r of bereiken(ref)) {
    const H = boek(r.slug).hoofdstukken;
    for (let c = Math.floor(r.van / 1000); c <= Math.floor(r.tot / 1000); c++) {
      const vs = H[c] || [], a = c === Math.floor(r.van / 1000) ? r.van % 1000 : 1, z = c === Math.floor(r.tot / 1000) ? r.tot % 1000 : vs.length;
      for (let v = a; v <= z; v++) uit.push(vs[v - 1]);
    }
  }
  return uit.join(" ").replace(/\s+/g, " ");
};
// Citaten ‘…’ (de apostrof in ‘Farao’s’ sluit een citaat niet af; lessen.js leest ze op dezelfde manier).
const citaten = (t: string) => [...t.matchAll(/‘(.+?)’(?![\p{L}])/gu)].map((m) => m[1]);

describe("lesroutes: opbouw", () => {
  it("6 tot 10 routes met een unieke, nette id en 3 tot 5 lessen", () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(6);
    expect(ROUTES.length).toBeLessThanOrEqual(10);
    expect(new Set(ROUTES.map((r) => r.id)).size).toBe(ROUTES.length);
    for (const r of ROUTES) {
      expect(r.id, r.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(r.n && r.kort && r.bereik, r.id).toBeTruthy();
      expect(r.lessen.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.lessen.length, r.id).toBeLessThanOrEqual(5);
    }
  });
  it("de pagina laadt dezelfde geschiedenissen als de atlas, en alle bestanden bestaan", () => {
    const gesch = (l: string[]) => l.filter((s) => s.startsWith("geschiedenissen/"));
    expect(gesch(lessenScripts)).toEqual(gesch(atlasScripts));
    expect(lessenScripts.slice(-2)).toEqual(["lessen-data.js", "lessen.js"]);
    for (const s of lessenScripts) expect(existsSync(join(PUB, "bijbelreis", s)), s).toBe(true);
  });
  it("bijbelreis.nl serveert de pagina op /bijbelreis/lessen (zoals /bijbelreis/boekje)", () => {
    const bestaat = (p: string) => existsSync(join(PUB, p));
    expect(bijbelreisPagina("/bijbelreis/lessen", bestaat)).toEqual({ bestand: "/bijbelreis/lessen.html" });
    expect(bijbelreisPagina("/bijbelreis/lessen.html", bestaat)).toEqual({ naar: "/bijbelreis/lessen" });
  });
});

describe("lesroutes: alleen naar wat bestaat", () => {
  it("elke les wijst naar een bestaande geschiedenis, waarvan alle reisstappen bestaan", () => {
    for (const { l, naam } of LESSEN) {
      const g = G.get(l.v);
      expect(g, `${naam}: geschiedenis ${l.v}`).toBeTruthy();
      for (const k of g!.stappen) expect(STAPPEN.has(k), `${naam}: stap ${k}`).toBe(true);
    }
  });
  it("een geschiedenis staat in hooguit één les", () => {
    const nrs = LESSEN.map(({ l }) => l.v);
    expect(new Set(nrs).size).toBe(nrs.length);
  });
  it("een extra link wijst naar een bestaand deel van de atlas", () => {
    for (const r of ROUTES.filter((r) => r.extra)) expect(DELEN.has(r.extra!.deel), r.id).toBe(true);
  });
  it("het gedeelte om samen te lezen valt binnen de verwijzing van de geschiedenis", () => {
    for (const { l, naam } of LESSEN) expect(binnen(l.lees, G.get(l.v)!.ref), `${naam}: ${l.lees} binnen ${G.get(l.v)!.ref}`).toBe(true);
  });
});

describe("lesroutes: de vragen", () => {
  it("elke les heeft 2 of 3 vragen, met vraag, antwoord en verwijzing", () => {
    for (const { l, naam } of LESSEN) {
      expect(l.vragen.length, naam).toBeGreaterThanOrEqual(2);
      expect(l.vragen.length, naam).toBeLessThanOrEqual(3);
    }
    for (const { v, naam } of VRAGEN) {
      expect(v.q, naam).toMatch(/\?$/);
      expect(v.a.trim().length, naam).toBeGreaterThan(1);
      expect(BR.parseRef(v.ref), `${naam}: ${v.ref}`).toBeTruthy();
    }
  });
  it("het antwoord staat in het gedeelte dat je samen leest", () => {
    for (const { l, v, naam } of VRAGEN) expect(binnen(v.ref, l.lees), `${naam}: ${v.ref} binnen ${l.lees}`).toBe(true);
  });
  it("elk citaat ‘…’ staat letterlijk zo in de Statenvertaling bij de verwijzing", () => {
    let n = 0;
    for (const { v, naam } of VRAGEN) for (const c of citaten(v.a)) { n++; expect(tekst(v.ref), `${naam}: ‘${c}’`).toContain(c); }
    expect(n).toBeGreaterThan(20);
  });
  it("elke vraag heeft een controleregel in scripts/bijbel-controle/lessen.txt, en die regel klopt", () => {
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", "lessen.txt"), "utf8").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#"))
      .map((r) => { const i = r.indexOf("|"); return { ref: r.slice(0, i).trim(), re: r.slice(i + 1).trim() }; });
    expect(regels.length).toBe(VRAGEN.length);
    for (const { v, naam } of VRAGEN) {
      const r = regels.find((x) => x.ref === v.ref);
      expect(r, `${naam}: geen regel voor ${v.ref}`).toBeTruthy();
      expect(tekst(v.ref), `${naam}: ${r!.re}`).toMatch(new RegExp(r!.re, "i"));
    }
  });
});
