// ‘De wereld in die tijd’: de perioden ‘perzie’ (Perzië van Darius I tot Nehemia, 522–430 v.Chr.) en ‘geboorte-jezus’
// (Herodes en de keizers van Rome, 40 v.Chr. – 40 n.Chr.), gebouwd door scripts/bijbelreis-wereld-perzie-rome.py, en
// de uitbreiding van de rekenkern voor een as met v.Chr. en n.Chr. (kern.js). Verantwoording:
// docs/bijbelreis-wereld/perzie-bronnen.md en docs/bijbelreis-wereld/geboorte-jezus-bronnen.md.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
// @ts-expect-error: gewoon JavaScript-bestand zonder typen (scripts/)
import * as V from "../scripts/bijbelreis-verhalen.mjs";

type Gedateerd = { jaar: number; status: string; bron: string | string[]; marge?: [number, number]; opmerking?: string; begin?: string; einde?: string };
type Ring = [number, number][];
type Geo = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Persoon = { id: string; naam: string; alt: string[]; personenId: string | null; lijn: string; ambt?: string; van: Gedateerd; tot: Gedateerd; ouder: string | null; rol: string; ref: string[]; gebeurtenissen: string[]; verhaal: string | null; opmerking?: string };
type Gebeurtenis = { id: string; titel: string; tekst: string; jaar: number; tot: number | null; status: string; bron: string | string[]; personen: string[]; plaats: string | [number, number] | null; verhaal: string | null; belangrijk: boolean; stap?: string; marge?: [number, number]; opmerking?: string };
type Gebied = { id: string; naam: string; kleur: string; hoofdstad: string | null; bron: string[]; opmerking?: string; sleutels: { jaar: number; betrouwbaarheid: string; geometrie: Geo; opmerking?: string }[] };
type Stad = { id: string; naam: string; plaatsId: string | null; lat: number; lng: number; tekst: string; bron: string | string[] };
type Periode = {
  id: string; titel: string; ondertitel: string; start: number; kader?: [[number, number], [number, number]];
  as: { soort: string; van: number; tot: number; stap: number; label: string };
  bronnen: { id: string; kort?: string; soort: string; titel: string; url: string | null; licentie: string; geraadpleegd: string }[];
  personen: Persoon[]; gebeurtenissen: Gebeurtenis[]; gebieden: Gebied[]; steden: Stad[];
  koppelingen: { verhaal: string; jaar: number; tot: number | null; status: string; personen: string[]; gebeurtenissen: string[]; opmerking?: string }[];
  info?: { kop: string; tekst: string; status: string; bron: string | string[] }[];
};
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };
type Kern = {
  naarT: (j: number, as: object) => number; naarJaar: (t: number, as: object) => number; jaarTekst: (t: number, as: object, kort?: boolean) => string;
  gemengd: (as: object) => boolean; tweeJaren: (a: number, b: number, as: object, of?: boolean) => string; streepTekst: (t: number, as: object) => string;
  streepjes: (t0: number, t1: number, px: number, min: number, as?: object) => { stap: number; ticks: number[] };
  controleer: (d: unknown, refs?: object) => string[];
  bereid: (d: unknown, ctx?: object) => { personen: { id: string; t0: number; t1: number; einde: string }[]; byId: Map<string, { id: string; t0: number; t1: number; einde: string }> };
  overlap: (a: object, b: object) => { jaren: number };
  leeftNog: (p: object, t: number) => boolean;
  momenten: (m: unknown) => { t: number; soort: string; persoon?: string }[];
};

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const WERELD = join(PUB, "bijbelreis", "wereld");
const lees = (id: string) => JSON.parse(readFileSync(join(WERELD, "perioden", id + ".json"), "utf8")) as Periode;
const PZ = lees("perzie"), GJ = lees("geboorte-jezus"), DAN = lees("daniel-babylon");
// window is hier het globale object zelf (zoals in de browser), zodat ook ingang.js en kern.js laden.
const ctx: Record<string, unknown> & { BR?: unknown } = {};
ctx.window = ctx;
for (const s of ["plaatsen.js", "personen.js", "verwijzing.js", "wereld/ingang.js", "wereld/kern.js"]) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8"), ctx);
const BR = ctx.BR as { plaatsen: Record<string, { n: string; ll: [number, number] }>; mensen: Record<string, { n: string }>; parseRef: (r: string) => { ranges: Range[] } | null; wereldKern: Kern; wereld: { uitAdres: (h: string) => { periode: string; jaar: number | null } | null; adres: (p: string, j: number) => string } };
const K = BR.wereldKern;
const verhalen = new Set((V.laadGegevens(PUB) as { geschiedenissen: { nr: number }[] }).geschiedenissen.map((g) => "v" + g.nr));
const stappen = JSON.parse(readFileSync(join(ROOT, "tests", "bijbelreis-stappen.json"), "utf8")) as Record<string, string>;
const css = readFileSync(join(PUB, "bijbelreis", "bijbelreis.css"), "utf8");
const STATUS = ["expliciet", "berekend", "traditioneel", "historisch", "benaderd"];

// ---------- Statenvertaling (data/statenvertaling, alleen voor controle)
const bijbel: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function verzen(ref: string): string | null {
  const q = BR.parseRef(ref);
  if (!q || !q.ranges.length) return null;
  const uit: string[] = [];
  for (const rg of q.ranges) {
    const file = join(ROOT, "data", "statenvertaling", rg.slug + ".json");
    if (!existsSync(file)) return null;
    bijbel[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bijbel[rg.slug].hoofdstukken;
    const c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
    for (let c = rg.c1; c <= c2; c++) {
      const vv = H[c];
      if (!vv) return null;
      const a = c === rg.c1 ? rg.v1 : 1, z = c === c2 && rg.v2 !== 999 ? rg.v2 : vv.length;
      if (a > vv.length || z > vv.length || z < a) return null;
      uit.push(...vv.slice(a - 1, z));
    }
  }
  return uit.join(" ");
}
const zinnen = (t: string) => t.split(/(?<=[.!?])(?<!v\.Chr\.)(?<!n\.Chr\.)\s+(?=[A-Z‘“])/).filter(Boolean);
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").toLowerCase();
const bronnenVan = (b: string | string[]) => (Array.isArray(b) ? b : [b]);

// ---------- meetkunde
const segSnijdt = (a: number[], b: number[], c: number[], d: number[]) => {
  const o = (p: number[], q: number[], r: number[]) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
};
function ringFouten(r: Ring): string[] {
  const f: string[] = [];
  if (r.length < 4) f.push("minder dan 3 punten");
  if (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) f.push("ring niet gesloten");
  const n = r.length - 1;
  for (let i = 0; i < n; i++) {
    if (r[i][0] === r[i + 1][0] && r[i][1] === r[i + 1][1]) f.push(`dubbel punt ${r[i]}`);
    for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1) && segSnijdt(r[i], r[i + 1], r[j], r[j + 1])) f.push(`zelfdoorsnijding bij ${r[i]} en ${r[j]}`);
  }
  let opp = 0;
  for (let i = 0; i < n; i++) opp += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
  if (opp <= 0) f.push("buitenring niet tegen de klok in (RFC 7946)");
  return f;
}
function binnenRing(r: Ring, lng: number, lat: number) {
  let in_ = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
}
const ringen = (g: Geo): Ring[] => (g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]));
function ligtIn(P: Periode, gebied: string, jaar: number, plek: string | [number, number]) {
  const gb = P.gebieden.find((x) => x.id === gebied)!;
  const k = gb.sleutels.find((s) => s.jaar === jaar);
  if (!k) throw new Error(`${gebied} heeft geen sleutel ${jaar}`);
  const [lat, lng] = Array.isArray(plek) ? plek : (() => { const s = P.steden.find((x) => x.id === plek)!; return [s.lat, s.lng]; })();
  return ringen(k.geometrie).some((r) => binnenRing(r, lng, lat));
}
// Oppervlak van de doorsnede van twee vormen, benaderd op een raster van 0,05 graad (genoeg om dubbel kleuren te vinden).
function overlapCellen(a: Geo, b: Geo) {
  const ra = ringen(a), rb = ringen(b);
  const box = (rs: Ring[]) => rs.flat().reduce((m, [x, y]) => [Math.min(m[0], x), Math.min(m[1], y), Math.max(m[2], x), Math.max(m[3], y)], [999, 999, -999, -999]);
  const [ax0, ay0, ax1, ay1] = box(ra), [bx0, by0, bx1, by1] = box(rb);
  const x0 = Math.max(ax0, bx0), y0 = Math.max(ay0, by0), x1 = Math.min(ax1, bx1), y1 = Math.min(ay1, by1);
  let n = 0;
  for (let x = x0 + 0.025; x < x1; x += 0.05) for (let y = y0 + 0.025; y < y1; y += 0.05) if (ra.some((r) => binnenRing(r, x, y)) && rb.some((r) => binnenRing(r, x, y))) n++;
  return n;
}

// ---------- de gemeenschappelijke controle van beide perioden
for (const P of [PZ, GJ]) {
  const bronIds = new Set(P.bronnen.map((b) => b.id));
  const bronOk = (b: string) => bronIds.has(b) || verzen(b) !== null;
  const persIds = new Set(P.personen.map((p) => p.id));
  const gebIds = new Set(P.gebeurtenissen.map((g) => g.id));
  const stadIds = new Set(P.steden.map((s) => s.id));
  const binnenAs = (j: number) => { const t = K.naarT(j, P.as), a = K.naarT(P.as.van, P.as), b = K.naarT(P.as.tot, P.as); return t >= Math.min(a, b) && t <= Math.max(a, b); };
  const teksten: [string, string][] = [];
  const verzamel = (naam: string, x: unknown) => {
    if (typeof x === "string") teksten.push([naam, x]);
    else if (Array.isArray(x)) x.forEach((y, i) => verzamel(`${naam}[${i}]`, y));
    else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (k !== "geometrie") verzamel(`${naam}.${k}`, v);
  };
  verzamel("", P);

  describe(`wereld ${P.id}: datamodel, status en bron`, () => {
    it("de controle van de kern vindt niets", () => {
      expect(K.controleer(P, { plaatsen: BR.plaatsen, mensen: BR.mensen, verhalen, refOk: (r: string) => verzen(r) !== null })).toEqual([]);
    });
    it("ids zijn uniek en eenvoudig; bronnen hebben soort, titel, korte naam, licentie en raadpleegdatum", () => {
      for (const lijst of [P.bronnen, P.personen, P.gebeurtenissen, P.gebieden, P.steden]) {
        const ids = lijst.map((x) => x.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
      for (const b of P.bronnen) {
        expect(["bijbel", "historisch", "dataset"], b.id).toContain(b.soort);
        expect(b.titel && b.licentie && b.kort, b.id).toBeTruthy();
        expect(b.geraadpleegd, b.id).toBe("2026-11-17");
        if (b.url) expect(b.url, b.id).toMatch(/^https:\/\//);
        if (b.id.startsWith("pleiades")) expect(b.licentie).toMatch(/CC BY 3\.0.*Pleiades/);
      }
    });
    it("levenslijnen: status, bron, geen verzonnen geboortejaar, begin vóór einde", () => {
      for (const p of P.personen) {
        for (const [k, x] of [["van", p.van], ["tot", p.tot]] as [string, Gedateerd][]) {
          expect(STATUS, `${p.id}.${k}`).toContain(x.status);
          expect(Number.isInteger(x.jaar), `${p.id}.${k}`).toBe(true);
          for (const b of bronnenVan(x.bron)) expect(bronOk(b), `${p.id}.${k}: ${b}`).toBe(true);
          if (x.marge) { const [a, b] = x.marge.map((j) => K.naarT(j, P.as)).sort((u, v) => u - v); const t = K.naarT(x.jaar, P.as); expect(a <= t && t <= b, `${p.id}.${k}: marge`).toBe(true); }
        }
        // Van niemand in deze perioden is het geboortejaar bekend: geen lijn begint bij een geboorte.
        expect(p.van.begin, p.id).not.toBe("geboorte");
        expect(["regering", "roeping", "genoemd", "weggevoerd"], p.id).toContain(p.van.begin);
        expect(K.naarT(p.van.jaar, P.as) <= K.naarT(p.tot.jaar, P.as), p.id).toBe(true);
        if (!binnenAs(p.tot.jaar)) expect(p.tot.opmerking, `${p.id} loopt na de as door: zeg het`).toMatch(/na het einde van deze tijdlijn/);
        expect(p.rol, p.id).toBeTruthy();
        for (const r of p.ref) expect(verzen(r), `${p.id}: ref ${r}`).not.toBeNull();
        if (p.personenId) expect(BR.mensen[p.personenId], `${p.id} → ${p.personenId}`).toBeTruthy();
        if (p.ouder) expect(persIds.has(p.ouder), `${p.id}: ouder`).toBe(true);
        for (const g of p.gebeurtenissen) expect(gebIds.has(g), `${p.id}: ${g}`).toBe(true);
        if (p.verhaal) expect(verhalen.has(p.verhaal), `${p.id}: ${p.verhaal}`).toBe(true);
      }
    });
    it("gebeurtenissen: 8–12 stuks, 3–5 belangrijkste, 1–2 zinnen, status en bron, uitleg bij alles wat niet ‘historisch’ is", () => {
      expect(P.gebeurtenissen.length).toBeGreaterThanOrEqual(8);
      expect(P.gebeurtenissen.length).toBeLessThanOrEqual(12);
      const bel = P.gebeurtenissen.filter((g) => g.belangrijk).length;
      expect(bel).toBeGreaterThanOrEqual(3);
      expect(bel).toBeLessThanOrEqual(5);
      for (const g of P.gebeurtenissen) {
        expect(["expliciet", "historisch", "benaderd"], g.id).toContain(g.status);
        for (const b of bronnenVan(g.bron)) expect(bronOk(b), `${g.id}: ${b}`).toBe(true);
        const n = zinnen(g.tekst).length;
        expect(n >= 1 && n <= 2, `${g.id}: ${n} zinnen`).toBe(true);
        expect(binnenAs(g.jaar), g.id).toBe(true);
        if (g.status !== "historisch") expect(g.opmerking, g.id).toBeTruthy();
        for (const p of g.personen) expect(persIds.has(p), `${g.id}: ${p}`).toBe(true);
        if (typeof g.plaats === "string") expect(BR.plaatsen[g.plaats], `${g.id}: ${g.plaats}`).toBeTruthy();
        if (g.verhaal) expect(verhalen.has(g.verhaal), `${g.id}: ${g.verhaal}`).toBe(true);
        if (g.stap) expect(stappen[g.stap], `${g.id}: stap ${g.stap}`).toBeTruthy();
      }
    });
    it("steden: plaatsId met dezelfde ligging als plaatsen.js, of lat/lng met een dataset als bron", () => {
      for (const s of P.steden) {
        for (const b of bronnenVan(s.bron)) expect(bronOk(b), `${s.id}: ${b}`).toBe(true);
        if (s.plaatsId) {
          const pl = BR.plaatsen[s.plaatsId];
          expect(pl, s.id).toBeTruthy();
          expect(Math.abs(pl.ll[0] - s.lat) + Math.abs(pl.ll[1] - s.lng), s.id).toBeLessThan(1e-6);
        } else expect(bronnenVan(s.bron).some((b) => P.bronnen.find((x) => x.id === b)?.soort === "dataset"), s.id).toBe(true);
        expect(zinnen(s.tekst).length, s.id).toBeLessThanOrEqual(2);
      }
    });
    it("gebieden: altijd ‘benaderd’, met bron en uitleg, kleur uit de huisstijl, geldige ringen op 0,05 graad", () => {
      for (const gb of P.gebieden) {
        for (const b of gb.bron) expect(bronOk(b), `${gb.id}: ${b}`).toBe(true);
        expect(gb.opmerking, gb.id).toMatch(/^Grenzen bij benadering/);
        expect(css, `${gb.id}: --${gb.kleur}`).toMatch(new RegExp(`--${gb.kleur}:`));
        if (gb.hoofdstad) expect(stadIds.has(gb.hoofdstad), gb.id).toBe(true);
        expect(gb.sleutels.length, gb.id).toBeGreaterThanOrEqual(2);
        gb.sleutels.forEach((s, i) => {
          expect(s.betrouwbaarheid, `${gb.id} ${s.jaar}`).toBe("benaderd");
          expect(binnenAs(s.jaar), `${gb.id} ${s.jaar}`).toBe(true);
          if (i) expect(K.naarT(s.jaar, P.as), gb.id).toBeGreaterThan(K.naarT(gb.sleutels[i - 1].jaar, P.as));
          for (const r of ringen(s.geometrie)) {
            expect(ringFouten(r), `${gb.id} ${s.jaar}`).toEqual([]);
            for (const [x, y] of r) expect(Math.abs(x * 20 - Math.round(x * 20)) + Math.abs(y * 20 - Math.round(y * 20)), `${gb.id} ${s.jaar}`).toBeLessThan(1e-6);
          }
        });
      }
    });
    it("koppelingen: bestaande verhalen, personen en gebeurtenissen; jaar binnen de as", () => {
      expect(P.koppelingen.length).toBeGreaterThan(0);
      for (const k of P.koppelingen) {
        expect(verhalen.has(k.verhaal), k.verhaal).toBe(true);
        expect(STATUS).toContain(k.status);
        for (const p of k.personen) expect(persIds.has(p), `${k.verhaal}: ${p}`).toBe(true);
        for (const g of k.gebeurtenissen) expect(gebIds.has(g), `${k.verhaal}: ${g}`).toBe(true);
        for (const j of [k.jaar, k.tot]) if (j !== null) expect(binnenAs(j), k.verhaal).toBe(true);
      }
    });
    it("korte citaten tussen ‘…’ zijn letterlijk Statenvertaling, met de verwijzing erachter, en staan in het controlebestand", () => {
      const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", `wereld-${P.id}.txt`), "utf8").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#"));
      expect(regels.length).toBeGreaterThanOrEqual(25);
      for (const r of regels) {
        const [ref, re] = r.split(" | ");
        const vers = verzen(ref);
        expect(vers, r).not.toBeNull();
        expect(fold(vers!), r).toMatch(new RegExp(fold(re), "i"));
      }
      const gedekt = regels.map((r) => fold(r.split(" | ")[1]));
      let n = 0;
      for (const [naam, t] of teksten) {
        for (const m of t.matchAll(/‘([^’]+)’/g)) {
          n++;
          const ref = t.slice((m.index ?? 0) + m[0].length).match(/\(([1-3]?\s?[A-Za-zëéïü]+ \d+:\d+(?:[–-]\d+)?)\)/);
          expect(ref, `${naam}: citaat zonder verwijzing: ${m[1]}`).not.toBeNull();
          expect(fold(verzen(ref![1]) || ""), `${naam}: ‘${m[1]}’ staat niet in ${ref![1]}`).toContain(fold(m[1]));
          expect(m[1].split(/\s+/).length, `${naam}: citaat te lang`).toBeLessThanOrEqual(12);
          expect(gedekt.some((g) => g.includes(fold(m[1]))), `${naam}: geen controleregel voor ‘${m[1]}’`).toBe(true);
        }
      }
      expect(n).toBeGreaterThan(0);
    });
    it("geen engel als handelende figuur en geen verzonnen geboortejaar in de teksten", () => {
      for (const [naam, t] of teksten) {
        expect(t, naam).not.toMatch(/\bengel(en)?\b/i);
        expect(t, naam).not.toMatch(/\bgeboren in \d|geboortejaar \d/i);
      }
    });
  });
}

describe("wereld perzie: rekent en tekent zoals de bronnen", () => {
  const P = (id: string) => PZ.personen.find((p) => p.id === id)!;
  const G = (id: string) => PZ.gebeurtenissen.find((g) => g.id === id)!;
  // Babylonisch-Perzische telling: het jaar waarin een koning begint, is zijn ‘begin-jaar’; zijn eerste jaar begint in de
  // lente erna. Het n-de jaar is dus (beginjaar − n) v.Chr., met de lente van dat jaar als begin.
  const jaarVan = (koning: string, n: number) => P(koning).van.jaar - n;
  it("de Bijbelse jaren van de koningen omgerekend: Haggaï 520, tempel 515, Esther 483/479/474, Ezra 458, Nehemia 445 en 433", () => {
    expect(jaarVan("darius-i", 2)).toBe(520); // Haggaï 1:1; Zacharia 1:1
    expect(P("haggai").van.jaar).toBe(520);
    expect(jaarVan("darius-i", 4)).toBe(518); // Zacharia 7:1
    expect(P("zacharia").tot.jaar).toBe(518);
    expect(G("tempel-klaar").marge).toEqual([jaarVan("darius-i", 6), jaarVan("darius-i", 6) - 1]); // Ezra 6:15: Adar = voorjaar 515
    expect(PZ.koppelingen.find((k) => k.verhaal === "v77")!.jaar).toBe(jaarVan("xerxes", 3)); // Esther 1:3
    expect(G("esther-koningin").jaar).toBe(jaarVan("xerxes", 7)); // Esther 2:16
    expect(PZ.koppelingen.find((k) => k.verhaal === "v78")!.jaar).toBe(jaarVan("xerxes", 12)); // Esther 3:7
    expect(G("purim").jaar).toBe(jaarVan("xerxes", 12) - 1); // de dertiende Adar van dat jaar
    expect(G("ezra-reis").jaar).toBe(jaarVan("artaxerxes", 7)); // Ezra 7:7–8
    expect(G("nehemia-verlof").jaar).toBe(jaarVan("artaxerxes", 20)); // Nehemia 2:1
    expect(G("muur-klaar").jaar).toBe(G("nehemia-verlof").jaar); // Nehemia 6:15, hetzelfde jaar
    expect(P("nehemia").tot.jaar).toBe(jaarVan("artaxerxes", 32)); // Nehemia 5:14; 13:6
    expect(P("nehemia").tot.jaar - P("nehemia").van.jaar).toBe(-12); // ‘zijnde twaalf jaren’
  });
  it("de koningen volgen elkaar op (Livius): Darius 522–486, Xerxes 486–465, Artaxerxes vanaf 465, ouder en kind", () => {
    expect([P("darius-i").van.jaar, P("darius-i").tot.jaar, P("xerxes").van.jaar, P("xerxes").tot.jaar, P("artaxerxes").van.jaar]).toEqual([522, 486, 486, 465, 465]);
    expect(P("xerxes").ouder).toBe("darius-i");
    expect(P("artaxerxes").ouder).toBe("xerxes");
  });
  it("omstreden zaken zijn eerlijk benoemd: Ahasveros = Xerxes, Arthahsasta = Artaxerxes I, Esther en Ezra ‘benaderd’", () => {
    expect(P("xerxes").opmerking).toMatch(/Xerxes I/);
    expect(P("xerxes").opmerking).toMatch(/Artaxerxes/);
    expect(P("artaxerxes").opmerking).toMatch(/Artaxerxes II/);
    for (const id of ["esther-koningin", "purim", "ezra-reis", "nehemia-verlof", "muur-klaar", "tempel-klaar"]) expect(G(id).status, id).toBe("benaderd");
    for (const id of ["darius-koning", "marathon", "salamis"]) expect(G(id).status, id).toBe("historisch");
  });
  it("sluit aan op Daniël en Babylon: Perzië in 522 is precies de vorm van 515 daar", () => {
    const dan = DAN.gebieden.find((g) => g.id === "perzie")!.sleutels.at(-1)!;
    const pz = PZ.gebieden.find((g) => g.id === "perzie")!.sleutels[0];
    expect(dan.jaar).toBe(515);
    expect(pz.geometrie).toEqual(dan.geometrie);
    expect(PZ.as.van).toBeGreaterThanOrEqual(DAN.as.tot);
  });
  it("de kaart ligt goed: Susan, Babel, Jeruzalem, Sardis en Memphis in Perzië; Athene niet; Thracië alleen 513–480; Jeruzalem in Juda", () => {
    for (const s of PZ.gebieden.find((g) => g.id === "perzie")!.sleutels) {
      for (const st of ["susa", "babylon", "jeruzalem", "sardis", "memphis", "persepolis", "ekbatana"]) expect(ligtIn(PZ, "perzie", s.jaar, st), `${st} ${s.jaar}`).toBe(true);
      for (const st of ["athene", "marathon"]) expect(ligtIn(PZ, "perzie", s.jaar, st), `${st} ${s.jaar}`).toBe(false);
      const byzantium: [number, number] = [41.2, 28.3]; // Thracië bij Byzantium
      expect(ligtIn(PZ, "perzie", s.jaar, byzantium), `Thracië ${s.jaar}`).toBe(s.jaar <= 513 && s.jaar >= 480);
    }
    for (const j of [522, 430]) { expect(ligtIn(PZ, "jehud", j, "jeruzalem")).toBe(true); expect(ligtIn(PZ, "grieken", j, "athene")).toBe(true); }
  });
});

describe("wereld geboorte-jezus: de Heere Jezus alleen in gebeurtenissen", () => {
  it("geen levenslijn, geen persoon en geen personenId voor de Heere Jezus", () => {
    for (const p of GJ.personen) {
      expect(p.naam + " " + p.alt.join(" "), p.id).not.toMatch(/jezus|christus|heere/i);
      expect(p.personenId || "", p.id).not.toMatch(/jezus/i);
    }
  });
  it("Zijn geboorte, doop, het begin van Zijn werk en Zijn kruisiging en opstanding staan als gebeurtenis met Bijbelverwijzing", () => {
    const over = GJ.gebeurtenissen.filter((g) => /Heere Jezus|Kind/.test(g.titel + g.tekst));
    expect(over.map((g) => g.id).sort()).toEqual(["doop", "geboorte", "kruisiging", "terug-nazareth", "twaalf-jaar"]);
    for (const g of over) {
      expect(bronnenVan(g.bron).some((b) => verzen(b) !== null), g.id).toBe(true);
      expect(g.verhaal, g.id).toBeTruthy();
      expect(g.status, g.id).toBe("benaderd");
      expect(g.marge, g.id).toBeTruthy();
    }
  });
});

describe("wereld geboorte-jezus: as zonder jaar 0, en wat de Bijbel en de geschiedschrijvers zeggen", () => {
  const M = K.bereid(GJ, { plaatsen: BR.plaatsen });
  const P = (id: string) => GJ.personen.find((p) => p.id === id)!;
  const G = (id: string) => GJ.gebeurtenissen.find((g) => g.id === id)!;
  it("een as ‘nchr’ van 40 v.Chr. tot 40 n.Chr., startjaar 5 v.Chr.; nergens het jaar 0", () => {
    expect(GJ.as).toMatchObject({ soort: "nchr", van: -40, tot: 40 });
    expect(GJ.start).toBe(-5);
    const jaren = JSON.stringify(GJ).match(/"(jaar|tot)":\s*0\b/g);
    expect(jaren).toBeNull();
  });
  it("Archelaüs regeerde van 4 v.Chr. tot 6 n.Chr.: ‘in zijn tiende jaar’ afgezet (Josephus), dus 9 jaar op de as", () => {
    const a = M.byId.get("archelaus")!;
    expect(a.t1 - a.t0).toBe(9);
    expect(a.einde).toBe("afgezet");
    expect(K.leeftNog(a, a.t1)).toBe(false);
  });
  it("Lukas 3:1–2: in het vijftiende jaar van Tiberius zijn Tiberius, Pilatus, Antipas, Filippus, Lysanias en Kajafas tegelijk in functie", () => {
    const t = K.naarT(G("vijftiende-jaar").jaar, GJ.as);
    for (const id of ["tiberius", "pilatus", "antipas", "filippus", "lysanias", "kajafas"]) {
      const p = M.byId.get(id)!;
      expect(t >= p.t0 && t <= p.t1, id).toBe(true);
    }
    expect(P("tiberius").van.jaar + 15 - 1).toBe(28); // het vijftiende jaar vanaf 14 n.Chr. (14 = het eerste)
  });
  it("de geboorte ligt vóór de dood van Herodes (Mattheüs 2:1, 19); de marge is 6–4 v.Chr.", () => {
    expect(K.naarT(G("geboorte").jaar, GJ.as)).toBeLessThan(K.naarT(P("herodes").tot.jaar, GJ.as));
    expect(G("geboorte").marge).toEqual([-6, -4]);
    expect(P("herodes").tot.opmerking).toMatch(/1 v\.Chr\./);
    expect(P("cyrenius").van.opmerking).toMatch(/Lukas 2:2|eerste beschrijving/);
    expect(P("cyrenius").van.opmerking).toMatch(/6 n\.Chr\./);
  });
  it("Mattheüs 2:22 op de kaart: in 4 v.Chr. ligt Bethlehem bij Archelaüs en Nazareth bij Antipas (Galilea)", () => {
    expect(ligtIn(GJ, "archelaus", -4, "bethlehem")).toBe(true);
    expect(ligtIn(GJ, "archelaus", -4, "jeruzalem")).toBe(true);
    expect(ligtIn(GJ, "antipas", -4, "nazareth")).toBe(true);
    expect(ligtIn(GJ, "archelaus", -4, "nazareth")).toBe(false);
    expect(ligtIn(GJ, "antipas", -4, "machaerus")).toBe(true);
    expect(ligtIn(GJ, "filippus", -4, "caesarea-filippi")).toBe(true);
    expect(ligtIn(GJ, "nabatea", 40, "petra")).toBe(true);
    expect(ligtIn(GJ, "abilene", 28, "abila")).toBe(true);
    expect(ligtIn(GJ, "parthie", -40, "ctesiphon")).toBe(true);
    expect(ligtIn(GJ, "judea", 6, "caesarea")).toBe(true);
  });
  it("het rijk van Herodes groeit zoals Josephus vertelt: kust en Gadara in 30, Paneas in 20 v.Chr.", () => {
    for (const j of [-37, -31]) { expect(ligtIn(GJ, "herodes", j, "jeruzalem")).toBe(true); expect(ligtIn(GJ, "herodes", j, "gadara")).toBe(false); expect(ligtIn(GJ, "herodes", j, "caesarea")).toBe(false); }
    for (const j of [-30, -5]) { expect(ligtIn(GJ, "herodes", j, "gadara")).toBe(true); expect(ligtIn(GJ, "herodes", j, "caesarea")).toBe(true); }
    expect(ligtIn(GJ, "herodes", -21, "caesarea-filippi")).toBe(false);
    expect(ligtIn(GJ, "herodes", -20, "caesarea-filippi")).toBe(true);
    for (const j of [-40, -31, -4, 40]) expect(ligtIn(GJ, "decapolis", j, "gadara"), `Gadara Decapolis ${j}`).toBe(true);
    for (const j of [-30, -5]) expect(ligtIn(GJ, "decapolis", j, "gadara"), `Gadara Herodes ${j}`).toBe(false);
    expect(ligtIn(GJ, "decapolis", -4, "gerasa")).toBe(true);
  });
  it("het Romeinse rijk kleurt niets dubbel: geen overlap met Herodes, zijn zonen, de Decapolis of Nabatea", () => {
    const rome = GJ.gebieden.find((g) => g.id === "rome")!;
    const actief = (gb: Gebied, j: number) => { const t = K.naarT(j, GJ.as), S = gb.sleutels.map((s) => K.naarT(s.jaar, GJ.as)); return t >= S[0] && t <= S[S.length - 1]; };
    const vormOp = (gb: Gebied, j: number) => { const t = K.naarT(j, GJ.as); let s = gb.sleutels[0]; for (const x of gb.sleutels) if (K.naarT(x.jaar, GJ.as) <= t) s = x; return s.geometrie; };
    for (const s of rome.sleutels) for (const gb of GJ.gebieden) {
      if (["rome", "abilene", "parthie"].includes(gb.id) || !actief(gb, s.jaar)) continue;
      // Een paar rastercellen langs een gedeelde grens komen van het afronden op 0,05 graad.
      expect(overlapCellen(s.geometrie, vormOp(gb, s.jaar)), `Rome ${s.jaar} × ${gb.id}`).toBeLessThanOrEqual(6);
    }
    expect(ligtIn(GJ, "rome", -40, "antiochie")).toBe(true);
    expect(ligtIn(GJ, "rome", -31, "alexandrie")).toBe(false);
    expect(ligtIn(GJ, "rome", -30, "alexandrie")).toBe(true);
    expect(ligtIn(GJ, "rome", 33, "caesarea-filippi")).toBe(false);
    expect(ligtIn(GJ, "rome", 34, "caesarea-filippi")).toBe(true); // na de dood van Filippus bij Syrië
  });
  it("het register opent elke gekoppelde geschiedenis in het jaar van de koppeling, ook v.Chr. als negatief jaar", () => {
    expect(BR.wereld.uitAdres("#wereld/geboorte-jezus/-6")).toMatchObject({ periode: "geboorte-jezus", jaar: -6 });
    expect(BR.wereld.adres("geboorte-jezus", -6)).toBe("#wereld/geboorte-jezus/-6");
    expect(BR.wereld.uitAdres("#wereld/perzie/445")).toMatchObject({ periode: "perzie", jaar: 445 });
    expect(BR.wereld.uitAdres("#wereld/perzie/--4")).toBeNull();
  });
});

describe("wereld kern: een as met v.Chr. en n.Chr. (geen jaar 0)", () => {
  const as = { soort: "nchr", van: -40, tot: 40 };
  it("van jaartal naar tijd en terug, zonder jaar 0", () => {
    expect([-40, -4, -1, 1, 6, 40].map((j) => K.naarT(j, as))).toEqual([-39, -3, 0, 1, 6, 40]);
    expect([-39, -3, 0, 1, 6, 40].map((t) => K.naarJaar(t, as))).toEqual([-40, -4, -1, 1, 6, 40]);
    expect([0, -3, 1, 33].map((t) => K.jaarTekst(t, as))).toEqual(["1 v.Chr.", "4 v.Chr.", "1 n.Chr.", "33 n.Chr."]);
    // Afronden geeft nooit het jaar 0, en hetzelfde jaar als de tekst.
    for (let t = -2; t <= 2; t += 0.1) { const j = Math.round(K.naarJaar(t, as)); expect(j, String(t)).not.toBe(0); expect(K.jaarTekst(K.naarT(j, as), as)).toBe(K.jaarTekst(t, as)); }
    // De bestaande assen veranderen niet.
    expect(K.jaarTekst(-539, { soort: "vchr", van: 627, tot: 515 })).toBe("539 v.Chr.");
    expect(K.naarT(539, { soort: "vchr" })).toBe(-539);
    expect(K.naarT(33, { soort: "nchr", van: 1, tot: 100 })).toBe(33);
    expect(K.gemengd(as)).toBe(true);
    expect(K.gemengd({ soort: "nchr", van: 1, tot: 100 })).toBe(false);
    expect(K.gemengd({ soort: "vchr", van: 627, tot: 515 })).toBe(false);
  });
  it("streepjes op ronde jaartallen, met v.Chr./n.Chr. erbij; bij grote stappen staat 1 n.Chr. waar het jaar 0 zou staan", () => {
    const { ticks } = K.streepjes(K.naarT(-40, as), 40, 8, 80, as);
    expect(ticks.map((t) => K.streepTekst(t, as))).toEqual(["40 v.Chr.", "30 v.Chr.", "20 v.Chr.", "10 v.Chr.", "1 n.Chr.", "10 n.Chr.", "20 n.Chr.", "30 n.Chr.", "40 n.Chr."]);
    const klein = K.streepjes(-3, 3, 40, 80, as).ticks.map((t) => K.streepTekst(t, as));
    expect(klein).toEqual(["4 v.Chr.", "2 v.Chr.", "2 n.Chr."]);
    expect(K.streepTekst(-539, { soort: "vchr", van: 627, tot: 515 })).toBe("539");
  });
  it("twee jaren (marge, tijdvak) als tekst", () => {
    expect(K.tweeJaren(-6, -4, as)).toBe("6–4 v.Chr.");
    expect(K.tweeJaren(-1, 1, as)).toBe("1 v.Chr.–1 n.Chr.");
    expect(K.tweeJaren(30, 33, as)).toBe("30–33 n.Chr.");
    expect(K.tweeJaren(587, 586, { soort: "vchr" }, true)).toBe("587 of 586 v.Chr.");
    expect(K.tweeJaren(1656, 1657, { soort: "am" })).toBe("jaar 1656–1657");
  });
  it("de controle vindt het jaar 0, een kapot kader en een ongeldig ambt; ‘afgezet’ is een geldig einde", () => {
    const d = structuredClone(GJ) as Periode & { kader: unknown };
    d.gebeurtenissen[0].jaar = 0; d.kader = [[40, 30], [30, 40]]; (d.personen[0] as Persoon).ambt = "<b>";
    const f = K.controleer(d).join("\n");
    expect(f).toContain("het jaar 0 bestaat niet");
    expect(f).toContain("kader moet");
    expect(f).toContain("ambt moet");
    expect(K.controleer(GJ)).toEqual([]);
    const m = K.momenten(K.bereid(GJ, { plaatsen: BR.plaatsen }));
    expect(m.filter((x) => x.soort === "afgezet").map((x) => x.persoon).sort()).toEqual(["antipas", "archelaus", "kajafas", "pilatus"]);
  });
});
