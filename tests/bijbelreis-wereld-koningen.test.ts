// Gegevenscontrole van twee perioden in de laag ‘De wereld in die tijd’ (gebouwd door scripts/bijbelreis-wereld-koningen.py):
//   public/bijbelreis/wereld/perioden/david-salomo.json    (docs/bijbelreis-wereld/david-salomo-bronnen.md)
//   public/bijbelreis/wereld/perioden/israel-assyrie.json  (docs/bijbelreis-wereld/israel-assyrie-bronnen.md)
// Elk gegeven heeft een status en een bron; elke verwijzing bestaat; grenzen zijn geldige ringen; steden liggen in het
// juiste rijk in het juiste jaar; de Bijbelse getallen zijn nagerekend; korte citaten zijn letterlijk Statenvertaling.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
// @ts-expect-error: gewoon JavaScript-bestand zonder typen (scripts/)
import * as V from "../scripts/bijbelreis-verhalen.mjs";

type Gedateerd = { jaar: number; status: string; bron: string | string[]; marge?: [number, number]; opmerking?: string; begin?: string; einde?: string; leeftijd?: number };
type Ring = [number, number][];
type Geo = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Persoon = { id: string; naam: string; personenId: string | null; lijn: string; van: Gedateerd; tot: Gedateerd; ouder: string | null; rol: string; ref: string[]; gebeurtenissen: string[]; verhaal: string | null; opmerking?: string };
type Gebeurtenis = { id: string; titel: string; tekst: string; jaar: number; tot: number | null; status: string; bron: string | string[]; personen: string[]; plaats: string | [number, number] | null; verhaal: string | null; belangrijk: boolean; stap?: string; marge?: [number, number]; opmerking?: string };
type Periode = {
  id: string; titel: string; ondertitel: string; start: number;
  as: { soort: string; van: number; tot: number; stap: number; label: string; status?: string; uitleg?: string };
  bronnen: { id: string; soort: string; titel: string; url: string | null; licentie: string; geraadpleegd: string }[];
  info: { kop: string; tekst: string; status: string; bron: string | string[] }[];
  personen: Persoon[]; gebeurtenissen: Gebeurtenis[];
  gebieden: { id: string; naam: string; kleur: string; hoofdstad: string | null; bron: string[]; opmerking?: string; sleutels: { jaar: number; betrouwbaarheid: string; geometrie: Geo; opmerking?: string }[] }[];
  steden: { id: string; naam: string; plaatsId: string | null; lat: number; lng: number; tekst: string; bron: string | string[] }[];
  koppelingen: { verhaal: string; jaar: number; tot: number | null; status: string; personen: string[]; gebeurtenissen: string[]; opmerking?: string }[];
};
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const lees = (id: string) => JSON.parse(readFileSync(join(PUB, "bijbelreis", "wereld", "perioden", id + ".json"), "utf8")) as Periode;
const DS = lees("david-salomo");
const IA = lees("israel-assyrie");
const ctx: { window: { BR?: { plaatsen: Record<string, { n: string; ll: [number, number] }>; mensen: Record<string, { n: string }>; parseRef: (r: string) => { ranges: Range[] } | null } } } = { window: {} };
for (const s of ["plaatsen.js", "personen.js", "verwijzing.js"]) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR!;
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
const zinnen = (t: string) => t.split(/(?<=[.!?])(?<!v\.Chr\.)\s+(?=[A-Z‘“])/).filter(Boolean);
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
function binnen(r: Ring, lng: number, lat: number) {
  let in_ = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
}
const ringen = (g: Geo): Ring[] => (g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]));
function ligtIn(P: Periode, gebied: string, jaar: number, stad: string) {
  const gb = P.gebieden.find((x) => x.id === gebied)!;
  const k = gb.sleutels.find((s) => s.jaar === jaar);
  if (!k) throw new Error(`${gebied} heeft geen sleutel ${jaar}`);
  const s = P.steden.find((x) => x.id === stad);
  if (!s) throw new Error(`stad ${stad} ontbreekt`);
  return ringen(k.geometrie).some((r) => binnen(r, s.lng, s.lat));
}
const persoon = (P: Periode, id: string) => P.personen.find((p) => p.id === id)!;
const gebeurtenis = (P: Periode, id: string) => P.gebeurtenissen.find((g) => g.id === id)!;

// ---------- dezelfde controles voor beide perioden
for (const P of [DS, IA]) {
  const bronIds = new Set(P.bronnen.map((b) => b.id));
  const persIds = new Set(P.personen.map((p) => p.id));
  const gebIds = new Set(P.gebeurtenissen.map((g) => g.id));
  const stadIds = new Set(P.steden.map((s) => s.id));
  const bronOk = (b: string) => bronIds.has(b) || verzen(b) !== null;

  describe(`wereld ${P.id}: opbouw, status en bron`, () => {
    it("vaste velden, een vchr-as, startjaar binnen de as, unieke ids", () => {
      expect(P.as).toMatchObject({ soort: "vchr", stap: 1 });
      expect(P.as.van).toBeGreaterThan(P.as.tot);
      expect(P.start <= P.as.van && P.start >= P.as.tot).toBe(true);
      expect(P.as.uitleg).toMatch(/Thiele/);
      const alle = [...P.personen, ...P.gebeurtenissen].map((x) => x.id);
      expect(new Set(alle).size, "persoon- en gebeurtenis-ids samen uniek").toBe(alle.length);
      for (const lijst of [P.bronnen, P.personen, P.gebeurtenissen, P.gebieden, P.steden]) {
        const ids = lijst.map((x) => x.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    });
    it("bronnen: soort, titel, licentie, raadpleegdatum; open datasets met CC BY", () => {
      for (const b of P.bronnen) {
        expect(["bijbel", "historisch", "dataset"], b.id).toContain(b.soort);
        expect(b.titel && b.licentie, b.id).toBeTruthy();
        expect(b.geraadpleegd, b.id).toMatch(/^\d{4}-\d\d-\d\d$/);
        if (b.url) expect(b.url, b.id).toMatch(/^https:\/\//);
      }
      for (const b of P.bronnen.filter((x) => x.id.startsWith("pleiades"))) expect(b.licentie).toMatch(/^CC BY 3\.0/);
      for (const i of P.info) { expect(STATUS).toContain(i.status); for (const b of bronnenVan(i.bron)) expect(bronOk(b), `info ${i.kop}: ${b}`).toBe(true); }
    });
    it("levenslijnen: status, bron, marge, volgorde; geen verzonnen geboortejaar", () => {
      for (const p of P.personen) {
        for (const [k, x] of [["van", p.van], ["tot", p.tot]] as [string, Gedateerd][]) {
          expect(STATUS, `${p.id}.${k}`).toContain(x.status);
          expect(Number.isInteger(x.jaar), `${p.id}.${k}`).toBe(true);
          for (const b of bronnenVan(x.bron)) expect(bronOk(b), `${p.id}.${k}: bron ${b}`).toBe(true);
          if (x.marge) expect(x.marge[0] >= x.jaar && x.jaar >= x.marge[1], `${p.id}.${k}: marge`).toBe(true);
        }
        expect(p.van.jaar, p.id).toBeGreaterThan(p.tot.jaar);
        if (p.van.jaar > P.as.van) expect(p.van.opmerking, `${p.id} begint vóór de as: zeg het`).toMatch(/vóór deze tijdlijn|Thiele|Josephus/);
        if (p.tot.jaar < P.as.tot) expect(p.tot.opmerking, `${p.id} loopt na de as door: zeg het`).toMatch(/na het einde van deze tijdlijn/);
        expect(["stierf", "weggenomen", "onbekend", "leeft door"], p.id).toContain(p.tot.einde);
        expect(p.rol, p.id).toBeTruthy();
        for (const r of p.ref) expect(verzen(r), `${p.id}: ref ${r}`).not.toBeNull();
        // Een geboortejaar staat nergens in de Bijbel: alleen omgerekend uit een leeftijd, dus nooit meer dan ‘benaderd’.
        if (p.van.begin === "geboorte") { expect(p.van.status, p.id).toBe("benaderd"); expect(p.van.opmerking, p.id).toMatch(/geen geboortejaar/); }
        if (p.personenId) expect(BR.mensen[p.personenId], `${p.id} → ${p.personenId}`).toBeTruthy();
        if (p.ouder) expect(persIds.has(p.ouder), `${p.id}: ouder`).toBe(true);
        for (const g of p.gebeurtenissen) expect(gebIds.has(g), `${p.id}: ${g}`).toBe(true);
        if (p.verhaal) expect(verhalen.has(p.verhaal), `${p.id}: ${p.verhaal}`).toBe(true);
      }
    });
    it("gebeurtenissen: 8–12 stuks, 3–5 belangrijkste, tekst van 1–2 zinnen, uitleg als het niet ‘historisch’ is", () => {
      expect(P.gebeurtenissen.length).toBeGreaterThanOrEqual(8);
      expect(P.gebeurtenissen.length).toBeLessThanOrEqual(12);
      const bel = P.gebeurtenissen.filter((g) => g.belangrijk).length;
      expect(bel >= 3 && bel <= 5, `${bel} belangrijk`).toBe(true);
      for (const g of P.gebeurtenissen) {
        expect(["expliciet", "historisch", "benaderd"], g.id).toContain(g.status);
        for (const b of bronnenVan(g.bron)) expect(bronOk(b), `${g.id}: bron ${b}`).toBe(true);
        const n = zinnen(g.tekst).length;
        expect(n >= 1 && n <= 2, `${g.id}: ${n} zinnen`).toBe(true);
        expect(g.jaar <= P.as.van && g.jaar >= P.as.tot, g.id).toBe(true);
        if (g.status !== "historisch") expect(g.opmerking, g.id).toBeTruthy();
        if (g.marge) expect(g.marge[0] >= g.jaar && g.jaar >= g.marge[1], `${g.id}: marge`).toBe(true);
        for (const p of g.personen) expect(persIds.has(p), `${g.id}: ${p}`).toBe(true);
        if (typeof g.plaats === "string") expect(BR.plaatsen[g.plaats], `${g.id}: ${g.plaats}`).toBeTruthy();
        if (g.verhaal) expect(verhalen.has(g.verhaal), `${g.id}: ${g.verhaal}`).toBe(true);
        if (g.stap) expect(stappen[g.stap], `${g.id}: stap ${g.stap}`).toBeTruthy();
      }
    });
    it("steden: plaatsId met dezelfde ligging als plaatsen.js, anders een dataset-bron (Pleiades)", () => {
      for (const s of P.steden) {
        for (const b of bronnenVan(s.bron)) expect(bronOk(b), `${s.id}: ${b}`).toBe(true);
        if (s.plaatsId) {
          const pl = BR.plaatsen[s.plaatsId];
          expect(pl, `${s.id}: ${s.plaatsId}`).toBeTruthy();
          expect(Math.abs(pl.ll[0] - s.lat) + Math.abs(pl.ll[1] - s.lng), `${s.id}: ligging wijkt af`).toBeLessThan(1e-6);
        } else expect(bronnenVan(s.bron).some((b) => P.bronnen.find((x) => x.id === b)?.soort === "dataset"), `${s.id}: ligging zonder dataset`).toBe(true);
        expect(zinnen(s.tekst).length, s.id).toBeLessThanOrEqual(2);
      }
    });
    it("gebieden: altijd ‘benaderd’, met bron en uitleg; hoofdstad is een stad; kleur is een huisstijltoken", () => {
      for (const gb of P.gebieden) {
        for (const b of gb.bron) expect(bronOk(b), `${gb.id}: ${b}`).toBe(true);
        expect(gb.opmerking, gb.id).toMatch(/^Grenzen bij benadering/);
        if (gb.hoofdstad) expect(stadIds.has(gb.hoofdstad), gb.id).toBe(true);
        expect(css, `${gb.id}: --${gb.kleur}`).toMatch(new RegExp(`--${gb.kleur}:`));
        expect(gb.sleutels.length, gb.id).toBeGreaterThanOrEqual(2);
        for (let i = 1; i < gb.sleutels.length; i++) expect(gb.sleutels[i].jaar, gb.id).toBeLessThan(gb.sleutels[i - 1].jaar);
        for (const s of gb.sleutels) {
          expect(s.betrouwbaarheid, `${gb.id} ${s.jaar}`).toBe("benaderd");
          expect(s.jaar <= P.as.van && s.jaar >= P.as.tot, `${gb.id} ${s.jaar}`).toBe(true);
          for (const r of ringen(s.geometrie)) {
            expect(ringFouten(r), `${gb.id} ${s.jaar}`).toEqual([]);
            for (const [x, y] of r) expect(Math.abs(x * 20 - Math.round(x * 20)) + Math.abs(y * 20 - Math.round(y * 20)), `${gb.id} ${s.jaar}`).toBeLessThan(1e-6);
          }
        }
      }
    });
    it("koppelingen: verhaal, personen en gebeurtenissen bestaan; jaar binnen de as", () => {
      for (const k of P.koppelingen) {
        expect(verhalen.has(k.verhaal), k.verhaal).toBe(true);
        expect(STATUS, k.verhaal).toContain(k.status);
        for (const p of k.personen) expect(persIds.has(p), `${k.verhaal}: ${p}`).toBe(true);
        for (const g of k.gebeurtenissen) expect(gebIds.has(g), `${k.verhaal}: ${g}`).toBe(true);
        for (const j of [k.jaar, k.tot]) if (j !== null) expect(j <= P.as.van && j >= P.as.tot, k.verhaal).toBe(true);
        if (k.tot !== null) expect(k.jaar).toBeGreaterThanOrEqual(k.tot);
      }
    });
  });

  describe(`wereld ${P.id}: tekst`, () => {
    const teksten: [string, string][] = [];
    const verzamel = (naam: string, x: unknown) => {
      if (typeof x === "string") teksten.push([naam, x]);
      else if (Array.isArray(x)) x.forEach((y, i) => verzamel(`${naam}[${i}]`, y));
      else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (k !== "geometrie") verzamel(`${naam}.${k}`, v);
    };
    verzamel("", P);
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", `wereld-${P.id}.txt`), "utf8").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#"));
    it("korte citaten tussen ‘…’ zijn letterlijk Statenvertaling, met verwijzing erachter, en hebben een controleregel", () => {
      const gedekt = regels.map((r) => fold(r.split(" | ")[1]));
      let n = 0;
      for (const [naam, t] of teksten) {
        for (const m of t.matchAll(/‘([^’]+)’/g)) {
          n++;
          const na = t.slice((m.index ?? 0) + m[0].length);
          const ref = na.match(/\(([1-3]?\s?[A-Za-zëéïü]+ \d+:\d+(?:[–-]\d+)?)\)/);
          expect(ref, `${naam}: citaat zonder verwijzing: ${m[1]}`).not.toBeNull();
          const vers = verzen(ref![1]);
          expect(vers, `${naam}: ${ref![1]}`).not.toBeNull();
          expect(fold(vers!), `${naam}: ‘${m[1]}’ staat niet in ${ref![1]}`).toContain(fold(m[1]));
          expect(m[1].split(/\s+/).length, `${naam}: citaat te lang`).toBeLessThanOrEqual(12);
          expect(gedekt, `${naam}: geen controleregel voor ‘${m[1]}’`).toContain(fold(m[1]));
        }
      }
      expect(n).toBeGreaterThan(5);
    });
    it(`de controleregels (scripts/bijbel-controle/wereld-${P.id}.txt) kloppen tegen de Statenvertaling`, () => {
      expect(regels.length).toBeGreaterThanOrEqual(35);
      for (const r of regels) {
        const [ref, re] = r.split(" | ");
        const vers = verzen(ref);
        expect(vers, r).not.toBeNull();
        expect(fold(vers!), r).toMatch(new RegExp(fold(re), "i"));
      }
    });
    it("geen verzonnen geboortejaar en geen engel als figuur", () => {
      for (const [naam, t] of teksten) {
        expect(t, naam).not.toMatch(/\bgeboren in \d|geboortejaar \d/i);
        expect(t, naam).not.toMatch(/\bengel(en)?\b/i);
      }
    });
  });
}

describe("wereld david-salomo: de Bijbelse getallen nagerekend (gangbare reconstructie, zoals dateringen.md)", () => {
  const P = DS;
  it("Saul 40 jaar (Handelingen 13:21); David 30 bij zijn troonsbestijging en 40 jaar koning (2 Samuël 5:4); Hebron 7½ jaar", () => {
    expect(persoon(P, "saul").van.jaar - persoon(P, "saul").tot.jaar).toBe(40);
    const david = persoon(P, "david");
    expect(david.van.jaar - 30).toBe(1010);
    expect(1010 - david.tot.jaar).toBe(40);
    expect(david.tot.leeftijd).toBe(30 + 40);
    expect(david.van.status).toBe("benaderd");
    expect(gebeurtenis(P, "jeruzalem").jaar).toBe(1010 - 7); // 7 jaar en 6 maanden
  });
  it("Salomo 40 jaar (1 Koningen 11:42); tempel van zijn 4e tot zijn 11e jaar (1 Koningen 6:37–38): 966–959", () => {
    const s = persoon(P, "salomo");
    expect(s.van.jaar - s.tot.jaar).toBe(40);
    expect(s.ouder).toBe("david");
    const t = gebeurtenis(P, "tempel");
    expect(t.jaar).toBe(s.van.jaar - 4);
    expect(t.tot).toBe(s.van.jaar - 11);
  });
  it("Rehabeam 41 bij zijn troonsbestijging, 17 jaar koning (1 Koningen 14:21); Sisak in zijn 5e jaar (14:25)", () => {
    const r = persoon(P, "rehabeam");
    expect(930 + 41).toBe(r.van.jaar);
    expect(930 - 17).toBe(r.tot.jaar);
    expect(r.tot.leeftijd).toBe(58);
    expect(gebeurtenis(P, "sisak-jeruzalem").jaar).toBe(930 - 5);
    expect(gebeurtenis(P, "sisak-jeruzalem").opmerking).toMatch(/niet onomstreden/);
    expect(persoon(P, "jerobeam").van.jaar - persoon(P, "jerobeam").tot.jaar).toBe(21); // 22 jaar, 931/930–910/909
    expect(gebeurtenis(P, "scheuring").marge).toEqual([931, 930]);
  });
  it("de buurvolken: geen jaartal in de Bijbel, dus ‘expliciet’ met een marge over de hele tijd van David in Jeruzalem", () => {
    const b = gebeurtenis(P, "buurvolken");
    expect(b.status).toBe("expliciet");
    expect(b.marge).toEqual([1003, 970]);
    expect(b.opmerking).toMatch(/geen jaren/);
  });
  it("Samuël valt binnen de as (hij sterft in de tijd van Davids vlucht); de Tel Dan-steen staat als context, niet op de as", () => {
    expect(persoon(P, "samuel").tot.jaar).toBeLessThan(P.as.van);
    expect(persoon(P, "samuel").tot.marge).toEqual([1020, 1010]);
    expect(P.info.map((i) => i.tekst).join(" ")).toMatch(/9e eeuw v\.Chr\./);
    expect(P.gebeurtenissen.some((g) => /Tel Dan|huis van David/.test(g.titel))).toBe(false);
  });
  it("alle verhalen over Saul, David en Salomo (v50–v62) zijn gekoppeld", () => {
    expect(P.koppelingen.map((k) => k.verhaal)).toEqual(Array.from({ length: 13 }, (_, i) => "v" + (50 + i)));
  });
  it("kaart: Jeruzalem pas vanaf 1003 bij Israël buiten Juda; Hebron in Juda onder David; na de scheuring twee rijken", () => {
    expect(ligtIn(P, "israel", 1010, "jeruzalem")).toBe(false);
    expect(ligtIn(P, "israel", 1010, "gibea")).toBe(true); // Benjamin onder Isboseth
    expect(ligtIn(P, "juda-hebron", 1010, "hebron")).toBe(true);
    expect(ligtIn(P, "juda-hebron", 1010, "gibea")).toBe(false);
    for (const st of ["jeruzalem", "dan", "berseba", "sichem"]) expect(ligtIn(P, "israel", 1003, st), st).toBe(true);
    expect(ligtIn(P, "israel", 930, "jeruzalem")).toBe(false);
    expect(ligtIn(P, "israel", 930, "sichem")).toBe(true);
    expect(ligtIn(P, "israel", 930, "dan")).toBe(true);
    expect(ligtIn(P, "juda", 930, "jeruzalem")).toBe(true);
    for (const st of ["gath", "gaza"]) expect(ligtIn(P, "filistea", 1050, st), st).toBe(true);
    expect(ligtIn(P, "israel", 1003, "gath")).toBe(false);
    expect(ligtIn(P, "fenicie", 1050, "tyrus")).toBe(true);
    expect(ligtIn(P, "ammon", 1050, "rabba")).toBe(true);
    for (const st of ["damascus", "zoba"]) expect(ligtIn(P, "aram-zoba", 1050, st), st).toBe(true);
    expect(ligtIn(P, "aram-zoba", 1050, "hamath")).toBe(false);
    for (const st of ["rabba", "damascus"]) expect(ligtIn(P, "onder-david", 990, st), st).toBe(true);
    expect(ligtIn(P, "onder-david", 990, "jeruzalem")).toBe(false);
    const eind = Object.fromEntries(P.gebieden.map((g) => [g.id, [g.sleutels[0].jaar, g.sleutels[g.sleutels.length - 1].jaar]]));
    expect(eind).toMatchObject({ "juda-hebron": [1010, 1004], juda: [930, 920], "onder-david": [992, 931] });
  });
});

describe("wereld israel-assyrie: de Bijbelse getallen en ijkpunten nagerekend", () => {
  const P = IA;
  const jaren = (id: string) => persoon(P, id).van.jaar - persoon(P, id).tot.jaar;
  it("ijkpunten met onafhankelijke bronnen: Qarqar 853, Jehu 841, Damascus 732, Samaria 722, Sanherib 701 en 681", () => {
    expect(gebeurtenis(P, "qarqar")).toMatchObject({ jaar: 853, status: "historisch" });
    expect(gebeurtenis(P, "jehu-schatting")).toMatchObject({ jaar: 841, status: "historisch" });
    expect(gebeurtenis(P, "damascus-valt")).toMatchObject({ jaar: 732, status: "historisch" });
    expect(gebeurtenis(P, "samaria-valt")).toMatchObject({ jaar: 722, status: "benaderd", marge: [723, 721] });
    expect(gebeurtenis(P, "sanherib-jeruzalem")).toMatchObject({ jaar: 701, status: "historisch" });
    expect(gebeurtenis(P, "dood-sanherib")).toMatchObject({ jaar: 681, status: "historisch" });
    for (const id of ["qarqar", "jehu-schatting"]) expect(gebeurtenis(P, id).opmerking, id).toMatch(/niet in de Bijbel|Bijbel vertelt deze slag niet/);
  });
  it("Jehu 841 zoals de Bijbelreis (Thiele), met 842 (Albright) uitgelegd; Achab sterft in het jaar van Qarqar (12 jaar ertussen)", () => {
    expect(persoon(P, "jehu").van.jaar).toBe(841);
    expect(P.info.find((i) => /841 of 842/.test(i.kop))!.tekst).toMatch(/Albright.*842/);
    expect(persoon(P, "achab").tot.jaar - persoon(P, "jehu").van.jaar).toBe(12);
  });
  it("regeringsjaren uit de Bijbel (telling met of zonder het eerste jaar: hooguit één jaar verschil)", () => {
    const bijbel: [string, number][] = [["achab", 22], ["jehu", 28], ["jerobeam-ii", 41], ["hosea-koning", 9], ["hizkia", 29]];
    for (const [id, n] of bijbel) expect(Math.abs(jaren(id) - n), id).toBeLessThanOrEqual(1);
  });
  it("Hizkia: Sanherib in zijn 14e jaar (2 Koningen 18:13) = 701, dus 715; 29 jaar (18:2) tot 686", () => {
    expect(persoon(P, "hizkia").van.jaar - 14).toBe(701);
    expect(persoon(P, "hizkia").van.jaar - 29).toBe(persoon(P, "hizkia").tot.jaar);
  });
  it("Assyrische koningen volgen elkaar op zonder gat (koningslijst)", () => {
    expect(persoon(P, "tiglatpileser-iii").tot.jaar).toBe(persoon(P, "salmanassar-v").van.jaar);
    expect(persoon(P, "salmanassar-v").tot.jaar).toBe(persoon(P, "sargon-ii").van.jaar);
    expect(persoon(P, "sargon-ii").tot.jaar).toBe(persoon(P, "sanherib").van.jaar);
    for (const id of ["salmanassar-iii", "tiglatpileser-iii", "salmanassar-v", "sargon-ii", "sanherib"]) expect(persoon(P, id).van.status, id).toBe("historisch");
  });
  it("Jona: geen jaartal, een tijdvak in de tijd van Jerobeam II; Elia weggenomen, niet gestorven", () => {
    const j = gebeurtenis(P, "jona-nineve");
    expect(j).toMatchObject({ jaar: 793, tot: 753, status: "expliciet" });
    expect([persoon(P, "jerobeam-ii").van.jaar, persoon(P, "jerobeam-ii").tot.jaar]).toEqual([793, 753]);
    expect(j.opmerking).toMatch(/geen jaar/);
    expect(persoon(P, "elia").tot.einde).toBe("weggenomen");
  });
  it("de verhalen v63–v67, v69, v70 en v72 zijn gekoppeld (v64 is Naäman, met Elisa)", () => {
    expect(P.koppelingen.map((k) => k.verhaal)).toEqual(["v63", "v64", "v65", "v66", "v67", "v69", "v70", "v72"]);
    expect(P.koppelingen.find((k) => k.verhaal === "v64")!.personen).toEqual(["elisa"]);
  });
  it("kaart: Assyrië groeit stap voor stap; Damascus valt in 732, Samaria in 722, Hamath in 720; Jeruzalem nooit", () => {
    for (const s of P.gebieden.find((g) => g.id === "assyrie")!.sleutels) for (const st of ["nineve", "kalhu", "assur"]) expect(ligtIn(P, "assyrie", s.jaar, st), `${st} ${s.jaar}`).toBe(true);
    for (const s of P.gebieden.find((g) => g.id === "assyrie")!.sleutels) expect(ligtIn(P, "assyrie", s.jaar, "jeruzalem"), `Jeruzalem ${s.jaar}`).toBe(false);
    expect(ligtIn(P, "assyrie", 733, "damascus")).toBe(false);
    expect(ligtIn(P, "assyrie", 732, "damascus")).toBe(true);
    expect(ligtIn(P, "assyrie", 723, "samaria")).toBe(false);
    expect(ligtIn(P, "assyrie", 722, "samaria")).toBe(true);
    for (const st of ["hamath", "qarqar"]) { expect(ligtIn(P, "assyrie", 721, st), st).toBe(false); expect(ligtIn(P, "assyrie", 720, st), st).toBe(true); }
    expect(ligtIn(P, "assyrie", 741, "qarqar")).toBe(false);
    expect(ligtIn(P, "assyrie", 681, "lachis")).toBe(false);
    for (const s of P.gebieden.find((g) => g.id === "israel")!.sleutels) expect(ligtIn(P, "israel", s.jaar, "samaria"), `Samaria ${s.jaar}`).toBe(true);
    expect(ligtIn(P, "israel", 733, "gathhefer")).toBe(true);
    expect(ligtIn(P, "israel", 732, "gathhefer")).toBe(false); // Galilea weggevoerd (2 Koningen 15:29)
    for (const j of [880, 681]) for (const st of ["jeruzalem", "lachis"]) expect(ligtIn(P, "juda", j, st), `${st} ${j}`).toBe(true);
    for (const j of [880, 732]) expect(ligtIn(P, "aram", j, "damascus"), `Damascus ${j}`).toBe(true);
    expect(ligtIn(P, "fenicie", 880, "tyrus")).toBe(true);
    const eind = Object.fromEntries(P.gebieden.map((g) => [g.id, g.sleutels[g.sleutels.length - 1].jaar]));
    expect(eind).toMatchObject({ assyrie: 681, israel: 722, aram: 732, juda: 681 });
  });
});

describe("wereld david-salomo en israel-assyrie: het bouwscript", () => {
  it("de JSON-bestanden zijn gelijk aan wat scripts/bijbelreis-wereld-koningen.py bouwt (als Python met shapely er is)", () => {
    let heeftShapely = true;
    try { execFileSync("python3", ["-c", "import shapely"], { stdio: "ignore" }); } catch { heeftShapely = false; }
    if (!heeftShapely) return;
    expect(execFileSync("python3", [join(ROOT, "scripts", "bijbelreis-wereld-koningen.py"), "--controle"], { encoding: "utf8" })).toMatch(/ok: david-salomo.*\n.*ok: israel-assyrie/s);
  });
});
