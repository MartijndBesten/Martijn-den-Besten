// Gegevenscontrole van de periode ‘Daniël en Babylon’ in de laag ‘De wereld in die tijd’
// (public/bijbelreis/wereld/perioden/daniel-babylon.json, gebouwd door scripts/bijbelreis-wereld-daniel.py).
// Regels: docs/bijbelreis-wereld/daniel-bronnen.md. Elk gegeven heeft een status en een bron; elke verwijzing bestaat;
// grenzen zijn geldige, niet-zelfdoorsnijdende ringen; sleutels lopen op in de tijd; korte citaten zijn letterlijk SV.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
// @ts-expect-error: gewoon JavaScript-bestand zonder typen (scripts/)
import * as V from "../scripts/bijbelreis-verhalen.mjs";

type Gedateerd = { jaar: number; status: string; bron: string | string[]; marge?: [number, number]; opmerking?: string; begin?: string; einde?: string };
type Ring = [number, number][];
type Geo = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Periode = {
  id: string; titel: string; ondertitel: string; start: number;
  as: { soort: string; van: number; tot: number; stap: number; label: string };
  bronnen: { id: string; soort: string; titel: string; url: string | null; licentie: string; geraadpleegd: string }[];
  personen: { id: string; naam: string; alt: string[]; personenId: string | null; lijn: string; van: Gedateerd; tot: Gedateerd; ouder: string | null; rol: string; ref: string[]; gebeurtenissen: string[]; verhaal: string | null; opmerking?: string }[];
  gebeurtenissen: { id: string; titel: string; tekst: string; jaar: number; tot: number | null; status: string; bron: string | string[]; personen: string[]; plaats: string | [number, number] | null; verhaal: string | null; belangrijk: boolean; stap?: string; marge?: [number, number]; opmerking?: string }[];
  gebieden: { id: string; naam: string; kleur: string; hoofdstad: string; bron: string[]; opmerking?: string; sleutels: { jaar: number; betrouwbaarheid: string; geometrie: Geo; opmerking?: string }[] }[];
  steden: { id: string; naam: string; plaatsId: string | null; lat: number; lng: number; tekst: string; bron: string | string[] }[];
  koppelingen: { verhaal: string; jaar: number; tot: number | null; status: string; personen: string[]; gebeurtenissen: string[]; opmerking?: string }[];
};
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const P = JSON.parse(readFileSync(join(PUB, "bijbelreis", "wereld", "perioden", "daniel-babylon.json"), "utf8")) as Periode;
const ctx: { window: { BR?: { plaatsen: Record<string, { n: string; ll: [number, number] }>; mensen: Record<string, { n: string }>; parseRef: (r: string) => { ranges: Range[] } | null } } } = { window: {} };
for (const s of ["plaatsen.js", "personen.js", "verwijzing.js"]) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR!;
const verhalen = new Set((V.laadGegevens(PUB) as { geschiedenissen: { nr: number }[] }).geschiedenissen.map((g) => "v" + g.nr));
const stappen = JSON.parse(readFileSync(join(ROOT, "tests", "bijbelreis-stappen.json"), "utf8")) as Record<string, string>;
const css = readFileSync(join(PUB, "bijbelreis", "bijbelreis.css"), "utf8");

const STATUS = ["expliciet", "berekend", "traditioneel", "historisch", "benaderd"];
const bronIds = new Set(P.bronnen.map((b) => b.id));
const persIds = new Set(P.personen.map((p) => p.id));
const gebIds = new Set(P.gebeurtenissen.map((g) => g.id));
const stadIds = new Set(P.steden.map((s) => s.id));

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
// Een bron is een bron-id uit de lijst of een Bijbelverwijzing die in de Statenvertaling bestaat.
const bronOk = (b: string) => bronIds.has(b) || verzen(b) !== null;
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
  for (const [x, y] of r) if (!(x >= -180 && x <= 180 && y >= -90 && y <= 90)) f.push(`punt buiten bereik ${x},${y}`);
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
function ligtIn(gebied: string, jaar: number, stad: string) {
  const gb = P.gebieden.find((x) => x.id === gebied)!;
  const k = gb.sleutels.find((s) => s.jaar === jaar);
  if (!k) throw new Error(`${gebied} heeft geen sleutel ${jaar}`);
  const s = P.steden.find((x) => x.id === stad)!;
  return ringen(k.geometrie).some((r) => binnen(r, s.lng, s.lat));
}

describe("wereld daniel-babylon: opbouw volgens het datamodel", () => {
  it("heeft de vaste velden, een vchr-as en een startjaar binnen de as", () => {
    expect(P.id).toBe("daniel-babylon");
    expect(P.titel).toBeTruthy();
    expect(P.as).toMatchObject({ soort: "vchr", stap: 1 });
    expect(P.as.van).toBeGreaterThan(P.as.tot);
    expect(P.start).toBeLessThanOrEqual(P.as.van);
    expect(P.start).toBeGreaterThanOrEqual(P.as.tot);
    for (const k of ["bronnen", "personen", "gebeurtenissen", "gebieden", "steden", "koppelingen"]) expect(Array.isArray((P as Record<string, unknown>)[k]), k).toBe(true);
  });
  it("ids zijn uniek en in eenvoudige vorm", () => {
    for (const lijst of [P.bronnen, P.personen, P.gebeurtenissen, P.gebieden, P.steden]) {
      const ids = lijst.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
  it("bronnen hebben soort, titel, licentie en raadpleegdatum", () => {
    for (const b of P.bronnen) {
      expect(["bijbel", "historisch", "dataset"], b.id).toContain(b.soort);
      expect(b.titel, b.id).toBeTruthy();
      expect(b.licentie, b.id).toBeTruthy();
      expect(b.geraadpleegd, b.id).toMatch(/^\d{4}-\d\d-\d\d$/);
      if (b.url) expect(b.url, b.id).toMatch(/^https:\/\//);
    }
    // Een open dataset met naamsvermelding: de licentie staat erbij.
    for (const b of P.bronnen.filter((x) => x.id.startsWith("pleiades"))) expect(b.licentie).toMatch(/CC BY/);
  });
});

describe("wereld daniel-babylon: elk gegeven heeft een status en een bron", () => {
  const gedateerd: [string, Gedateerd][] = P.personen.flatMap((p) => [[`${p.id}.van`, p.van], [`${p.id}.tot`, p.tot]] as [string, Gedateerd][]);
  it("levenslijnen: status, bron, jaartal binnen de as of erbuiten met reden, en van vóór tot", () => {
    for (const [naam, x] of gedateerd) {
      expect(STATUS, naam).toContain(x.status);
      expect(Number.isInteger(x.jaar), naam).toBe(true);
      for (const b of bronnenVan(x.bron)) expect(bronOk(b), `${naam}: bron ${b}`).toBe(true);
      if (x.marge) expect(x.marge[0] >= x.jaar && x.jaar >= x.marge[1], `${naam}: marge`).toBe(true);
    }
    for (const p of P.personen) {
      expect(p.van.jaar, p.id).toBeGreaterThan(p.tot.jaar);
      expect(p.van.jaar <= P.as.van, `${p.id} begint vóór de as`).toBe(true);
      if (p.tot.jaar < P.as.tot) expect(p.tot.opmerking, `${p.id} loopt na de as door: zeg het`).toMatch(/na het einde van deze tijdlijn/);
      expect(["stierf", "weggenomen", "onbekend", "leeft door"], p.id).toContain(p.tot.einde);
      expect(p.rol, p.id).toBeTruthy();
      for (const r of p.ref) expect(verzen(r), `${p.id}: ref ${r}`).not.toBeNull();
    }
  });
  it("geen verzonnen geboortejaar: wie geen geboortejaar in de Bijbel of de historie heeft, begint niet bij ‘geboren’", () => {
    for (const p of P.personen) expect(p.van.begin, p.id).not.toBe("geboren");
    const daniel = P.personen.find((p) => p.id === "daniel")!;
    expect(daniel.van.status).toBe("benaderd");
    expect(daniel.van.begin).toBe("weggevoerd");
    expect(daniel.van.opmerking).toMatch(/niet bij de geboorte/);
  });
  it("gebeurtenissen: status, bron, tekst van 1–2 zinnen, 8–12 stuks en 3–5 belangrijkste", () => {
    expect(P.gebeurtenissen.length).toBeGreaterThanOrEqual(8);
    expect(P.gebeurtenissen.length).toBeLessThanOrEqual(12);
    const bel = P.gebeurtenissen.filter((g) => g.belangrijk).length;
    expect(bel).toBeGreaterThanOrEqual(3);
    expect(bel).toBeLessThanOrEqual(5);
    for (const g of P.gebeurtenissen) {
      expect(["expliciet", "historisch", "benaderd"], g.id).toContain(g.status);
      expect(g.bron.length, g.id).toBeGreaterThan(0);
      for (const b of bronnenVan(g.bron)) expect(bronOk(b), `${g.id}: bron ${b}`).toBe(true);
      const n = zinnen(g.tekst).length;
      expect(n, g.id).toBeGreaterThanOrEqual(1);
      expect(n, g.id).toBeLessThanOrEqual(2);
      expect(g.jaar <= P.as.van && g.jaar >= P.as.tot, g.id).toBe(true);
      // Benaderd of alleen-Bijbel-met-jaartal: altijd uitleg erbij.
      if (g.status !== "historisch") expect(g.opmerking, g.id).toBeTruthy();
      if (g.marge) expect(g.marge[0] >= g.jaar && g.jaar >= g.marge[1], `${g.id}: marge`).toBe(true);
    }
  });
  it("omstreden dateringen zijn eerlijk benoemd", () => {
    const G = Object.fromEntries(P.gebeurtenissen.map((g) => [g.id, g]));
    expect(G["verwoesting-jeruzalem"].status).toBe("benaderd");
    expect(G["verwoesting-jeruzalem"].opmerking).toMatch(/586/);
    expect(G["verwoesting-jeruzalem"].opmerking).toMatch(/587/);
    expect(G["daniel-weggevoerd"].status).toBe("benaderd");
    expect(G["val-babylon"].status).toBe("historisch");
    expect(G["decreet-kores"].opmerking).toMatch(/Cyruscilinder/);
    expect(G["decreet-kores"].opmerking).toMatch(/niet dit bevel/);
    const darius = P.personen.find((p) => p.id === "darius-meder")!;
    expect(darius.opmerking).toMatch(/omstreden/);
    // Besluit 21-11-2026: de oudere gelijkstelling met Cyaxares II erbij, neutraal, met bron; nog steeds niet zeker.
    expect(darius.opmerking).toMatch(/Cyaxares II/);
    expect(darius.opmerking).toMatch(/zeker is het niet/);
    expect(P.bronnen.find((b) => b.id === "wiki-darius-meder")!.url).toBe("https://en.wikipedia.org/wiki/Darius_the_Mede");
  });
  it("steden en gebieden hebben een bron; gebieden zijn altijd ‘benaderd’", () => {
    for (const s of P.steden) for (const b of bronnenVan(s.bron)) expect(bronOk(b), `${s.id}: ${b}`).toBe(true);
    for (const gb of P.gebieden) {
      expect(gb.bron.length, gb.id).toBeGreaterThan(0);
      for (const b of gb.bron) expect(bronOk(b), `${gb.id}: ${b}`).toBe(true);
      expect(gb.opmerking, gb.id).toMatch(/bij benadering/);
      for (const s of gb.sleutels) expect(s.betrouwbaarheid, `${gb.id} ${s.jaar}`).toBe("benaderd");
    }
  });
});

describe("wereld daniel-babylon: verwijzingen bestaan", () => {
  it("personenId bestaat in personen.js; ouder en gebeurtenissen bestaan in dit bestand", () => {
    for (const p of P.personen) {
      if (p.personenId) expect(BR.mensen[p.personenId], `${p.id} → ${p.personenId}`).toBeTruthy();
      if (p.ouder) expect(persIds.has(p.ouder), `${p.id}: ouder ${p.ouder}`).toBe(true);
      for (const g of p.gebeurtenissen) expect(gebIds.has(g), `${p.id}: ${g}`).toBe(true);
      if (p.verhaal) expect(verhalen.has(p.verhaal), `${p.id}: ${p.verhaal}`).toBe(true);
    }
  });
  it("gebeurtenissen verwijzen naar bestaande personen, plaatsen, verhalen en stappen", () => {
    for (const g of P.gebeurtenissen) {
      for (const p of g.personen) expect(persIds.has(p), `${g.id}: ${p}`).toBe(true);
      if (typeof g.plaats === "string") expect(BR.plaatsen[g.plaats], `${g.id}: ${g.plaats}`).toBeTruthy();
      if (g.verhaal) expect(verhalen.has(g.verhaal), `${g.id}: ${g.verhaal}`).toBe(true);
      if (g.stap) expect(stappen[g.stap], `${g.id}: stap ${g.stap}`).toBeTruthy();
    }
  });
  it("steden: plaatsId bestaat en de ligging is gelijk aan plaatsen.js; anders lat/lng met een dataset-bron", () => {
    for (const s of P.steden) {
      if (s.plaatsId) {
        const pl = BR.plaatsen[s.plaatsId];
        expect(pl, `${s.id}: ${s.plaatsId}`).toBeTruthy();
        expect(Math.abs(pl.ll[0] - s.lat) + Math.abs(pl.ll[1] - s.lng), `${s.id}: ligging wijkt af van plaatsen.js`).toBeLessThan(1e-6);
      } else {
        expect(bronnenVan(s.bron).some((b) => P.bronnen.find((x) => x.id === b)?.soort === "dataset"), `${s.id}: ligging zonder dataset`).toBe(true);
      }
      expect(zinnen(s.tekst).length, s.id).toBeLessThanOrEqual(2);
    }
  });
  it("gebieden: hoofdstad is een stad, kleur is een huisstijltoken", () => {
    for (const gb of P.gebieden) {
      expect(stadIds.has(gb.hoofdstad), gb.id).toBe(true);
      expect(css, `${gb.id}: --${gb.kleur}`).toMatch(new RegExp(`--${gb.kleur}:`));
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

describe("wereld daniel-babylon: grenzen", () => {
  it("sleutels lopen op in de tijd (vchr: jaartal daalt), liggen op de as en zijn geldige ringen", () => {
    for (const gb of P.gebieden) {
      expect(gb.sleutels.length, gb.id).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < gb.sleutels.length; i++) expect(gb.sleutels[i].jaar, gb.id).toBeLessThan(gb.sleutels[i - 1].jaar);
      for (const s of gb.sleutels) {
        expect(s.jaar <= P.as.van && s.jaar >= P.as.tot, `${gb.id} ${s.jaar}`).toBe(true);
        expect(["Polygon", "MultiPolygon"]).toContain(s.geometrie.type);
        for (const r of ringen(s.geometrie)) expect(ringFouten(r), `${gb.id} ${s.jaar}`).toEqual([]);
        // Afgerond op 0,05 graad: klein bestand, geen schijnprecisie.
        for (const r of ringen(s.geometrie)) for (const [x, y] of r) expect(Math.abs(x * 20 - Math.round(x * 20)) + Math.abs(y * 20 - Math.round(y * 20)), `${gb.id} ${s.jaar}`).toBeLessThan(1e-6);
      }
    }
  });
  it("de rijken liggen geografisch plausibel: hoofdsteden en kernsteden binnen hun rijk", () => {
    const babel = P.gebieden.find((g) => g.id === "babylonie")!;
    for (const s of babel.sleutels) expect(ligtIn("babylonie", s.jaar, "babylon"), `Babel in Babylonië ${s.jaar}`).toBe(true);
    for (const j of [626, 560, 547]) expect(ligtIn("lydie", j, "sardis"), `Sardis ${j}`).toBe(true);
    for (const j of [614, 550]) expect(ligtIn("medie", j, "ekbatana"), `Ekbatana ${j}`).toBe(true);
    for (const j of [626, 613]) expect(ligtIn("assyrie", j, "nineve"), `Ninevé ${j}`).toBe(true);
    for (const j of [612, 610]) expect(ligtIn("assyrie", j, "harran"), `Haran ${j}`).toBe(true);
    for (const j of [626, 586]) expect(ligtIn("juda", j, "jeruzalem"), `Jeruzalem ${j}`).toBe(true);
    for (const j of [626, 609, 605, 525]) for (const st of ["memphis", "sais"]) expect(ligtIn("egypte", j, st), `${st} ${j}`).toBe(true);
    for (const st of ["jeruzalem", "tyrus", "karkemis"]) expect(ligtIn("egypte", 609, st), `${st} onder Necho`).toBe(true);
    for (const st of ["harran", "karkemis"]) expect(ligtIn("babylonie", 605, st), `${st} 605`).toBe(true);
    for (const st of ["jeruzalem", "tyrus"]) expect(ligtIn("babylonie", 604, st), `${st} 604`).toBe(true);
    expect(ligtIn("babylonie", 549, "tayma")).toBe(true);
    expect(ligtIn("babylonie", 604, "tayma")).toBe(false);
    expect(ligtIn("babylonie", 604, "susa")).toBe(false);
    expect(ligtIn("babylonie", 605, "jeruzalem")).toBe(false);
    for (const s of P.gebieden.find((g) => g.id === "perzie")!.sleutels) expect(ligtIn("perzie", s.jaar, "pasargadae"), `Pasargadae ${s.jaar}`).toBe(true);
    expect(ligtIn("perzie", 553, "ekbatana")).toBe(false);
    expect(ligtIn("perzie", 550, "ekbatana")).toBe(true);
    expect(ligtIn("perzie", 548, "sardis")).toBe(false);
    expect(ligtIn("perzie", 547, "sardis")).toBe(true);
    expect(ligtIn("perzie", 540, "babylon")).toBe(false);
    for (const st of ["babylon", "susa", "jeruzalem", "tyrus", "nineve", "harran"]) expect(ligtIn("perzie", 539, st), `${st} 539`).toBe(true);
    expect(ligtIn("perzie", 526, "memphis")).toBe(false);
    for (const st of ["memphis", "sais"]) expect(ligtIn("perzie", 525, st), `${st} 525`).toBe(true);
  });
  it("Assyrië verdwijnt vóór 609, Babel eindigt in 539, Lydië in 547, Egypte in 525, Juda in 586", () => {
    const eind = Object.fromEntries(P.gebieden.map((g) => [g.id, g.sleutels[g.sleutels.length - 1].jaar]));
    expect(eind).toMatchObject({ assyrie: 610, babylonie: 539, lydie: 547, egypte: 525, juda: 586, medie: 550, perzie: 515 });
  });
});

describe("wereld daniel-babylon: tekst", () => {
  const teksten: [string, string][] = [];
  const verzamel = (naam: string, x: unknown) => {
    if (typeof x === "string") teksten.push([naam, x]);
    else if (Array.isArray(x)) x.forEach((y, i) => verzamel(`${naam}[${i}]`, y));
    else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (k !== "geometrie") verzamel(`${naam}.${k}`, v);
  };
  verzamel("", P);
  it("korte citaten tussen ‘…’ zijn letterlijk Statenvertaling (met verwijzing erachter)", () => {
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
      }
    }
    expect(n).toBeGreaterThan(0);
  });
  it("de controleregels (scripts/bijbel-controle/wereld-daniel.txt) kloppen en dekken elk citaat", () => {
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", "wereld-daniel.txt"), "utf8").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#"));
    expect(regels.length).toBeGreaterThanOrEqual(40);
    for (const r of regels) {
      const [ref, re] = r.split(" | ");
      const vers = verzen(ref);
      expect(vers, r).not.toBeNull();
      expect(fold(vers!), r).toMatch(new RegExp(fold(re), "i"));
    }
    const gedekt = regels.map((r) => fold(r.split(" | ")[1]));
    for (const [naam, t] of teksten) for (const m of t.matchAll(/‘([^’]+)’/g)) expect(gedekt, `${naam}: geen controleregel voor ‘${m[1]}’`).toContain(fold(m[1]));
  });
  it("geen verzonnen geboortejaar in de teksten en geen engel als handelende figuur", () => {
    for (const [naam, t] of teksten) {
      expect(t, naam).not.toMatch(/\bgeboren in \d|geboortejaar \d/i);
      expect(t, naam).not.toMatch(/\bengel(en)?\b/i);
    }
  });
});
