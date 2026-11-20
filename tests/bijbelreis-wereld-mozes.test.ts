// ‘De wereld in die tijd’, periode ‘Mozes, Egypte en de woestijnreis’ (public/bijbelreis/wereld/perioden/mozes.json).
// Regels en bronnen: docs/bijbelreis-wereld/mozes-bronnen.md. De as telt in levensjaren van Mozes (0–120), niet in jaren
// v.Chr.: de datering van de uittocht is omstreden en de Bijbel noemt de farao niet bij naam. Getest: de Bijbelse getallen
// (Mozes 40, 80, 120; Aäron 83 en 123; Kaleb 40), de volgorde, de koppelingen, de reis (uit de reisstappen van de atlas),
// de landstreken zonder grenzen, de citaten (Statenvertaling) en de uitbreiding van de rekenkern (as ‘leeftijd’, reis).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const WERELD = join(PUB, "bijbelreis", "wereld");

type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };
type Stap = { r?: { p: unknown[]; recon?: number }[] };
type Br = {
  plaatsen: Record<string, { n: string; ll: [number, number]; c: string; alt?: unknown[] }>; W: Record<string, [number, number]>;
  mensen: Record<string, { n: string }>; geschiedenissen: { nr: number; t: string; ref: string }[]; boeken: unknown[];
  parseRef: (r: string) => { ranges: Range[] } | null; wereldKern: Record<string, (...a: never[]) => unknown>;
};
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
const ctx: { window: { BR?: Br } } = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
runInNewContext(readFileSync(join(WERELD, "kern.js"), "utf8"), ctx);
const BR = ctx.window.BR!;

type Persoon = { id: string; t0: number; t1: number; einde: string; voorAs: boolean; geboorteBekend: boolean; begin: string };
type Deel = { stap: string; t0: number; t1: number; len: number; alleen?: boolean; stukken: { pts: [number, number][]; recon: boolean; len: number }[] };
type Reis = { delen: Deel[]; onbekend: { t0: number; t1: number }[] };
type Model = { as: object; tMin: number; tMax: number; personen: Persoon[]; byId: Map<string, Persoon>; gebeurtenissen: { id: string; t: number; t2: number }[]; heeftKaart: boolean; reis: Reis; tempo: { t0: number; t1: number; factor: number }[] };
const K = BR.wereldKern as unknown as {
  controleer: (d: unknown, r?: object) => string[]; bereid: (d: unknown, c?: object) => Model; jaarTekst: (t: number, as: object, kort?: boolean) => string;
  leeftijd: (p: Persoon, t: number) => number | null; overlap: (a: Persoon, b: Persoon) => { jaren: number; ongeveer: boolean }; telt: (as: object) => boolean;
  stappenVan: (b: unknown[]) => Map<string, Stap>; reisOp: (r: Reis, t: number) => { i: number; f: number; ll: [number, number]; lopend: boolean; zwerft: unknown };
  afgelegd: (d: Deel, f: number) => { pts: [number, number][] }[];
};

// ---------- Statenvertaling ----------
const SV: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function verzen(ref: string): string | null {
  const q = BR.parseRef(ref);
  if (!q || !q.ranges.length) return null;
  const uit: string[] = [];
  for (const rg of q.ranges) {
    const f = join(ROOT, "data", "statenvertaling", rg.slug + ".json");
    if (!existsSync(f)) return null;
    SV[rg.slug] ??= JSON.parse(readFileSync(f, "utf8"));
    const H = SV[rg.slug].hoofdstukken, c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
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
const refOk = (r: string) => verzen(r) !== null;
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").toLowerCase();

const D = JSON.parse(readFileSync(join(WERELD, "perioden", "mozes.json"), "utf8"));
const STAPPEN = K.stappenVan(BR.boeken);
const REFS = { plaatsen: BR.plaatsen, W: BR.W, stappen: STAPPEN, mensen: BR.mensen, verhalen: new Set(BR.geschiedenissen.map((g) => "v" + g.nr)), refOk };
const M = K.bereid(D, { plaatsen: BR.plaatsen, W: BR.W, boeken: BR.boeken });
const P = (id: string) => M.byId.get(id)!;
const E = (id: string) => M.gebeurtenissen.find((e) => e.id === id)!;
const jaar = (t: number) => Math.round(t);

describe("wereld mozes: gegevens en Bijbelse getallen", () => {
  it("geldig volgens de controle, met de reisstappen en plaatsen van de atlas", () => {
    expect(K.controleer(D, REFS)).toEqual([]);
  });
  it("de as telt in levensjaren van Mozes (0–120), met uitleg; geen jaartal v.Chr. als as", () => {
    expect(D.as).toMatchObject({ soort: "leeftijd", wie: "Mozes", van: 0, tot: 120, label: "jaar in het leven van Mozes" });
    expect(D.as.uitleg).toMatch(/levensjaren van Mozes/);
    expect(K.jaarTekst(80.2, M.as)).toBe("jaar 80");
    expect(K.jaarTekst(80.2, M.as, true)).toBe("80");
    expect(K.jaarTekst(-3, M.as)).toBe("3 jaar vóór de geboorte van Mozes");
    const waarom = D.info.find((i: { kop: string }) => /geen jaartallen/.test(i.kop));
    expect(waarom.tekst).toMatch(/1446/);
    expect(waarom.tekst).toMatch(/13e eeuw/);
    expect(waarom.tekst).toMatch(/noemt de farao niet bij naam/);
    expect(waarom.status).toBe("benaderd");
  });
  it("Mozes: 40 bij de vlucht, 80 voor de farao, 120 bij zijn dood (Handelingen 7:23; Exodus 7:7; Deuteronomium 34:7)", () => {
    const m = P("mozes");
    expect([m.t0, m.t1, m.einde]).toEqual([0, 120, "stierf"]);
    expect(K.leeftijd(m, E("vlucht").t)).toBe(40);
    expect(K.leeftijd(m, E("braamstruik").t)).toBe(80);
    expect(K.leeftijd(m, E("voor-farao").t)).toBe(80);
    expect(K.leeftijd(m, 120)).toBe(120);
    expect(D.personen[0].tot).toMatchObject({ leeftijd: 120, status: "expliciet", bron: "Deuteronomium 34:7" });
  });
  it("Aäron: drie jaar ouder (Exodus 7:7), 83 voor de farao en 123 bij zijn dood (Numeri 33:39), toen Mozes 120 was", () => {
    const a = P("aaron");
    expect(a.voorAs && a.geboorteBekend).toBe(true);
    expect(K.leeftijd(a, E("voor-farao").t)).toBe(83);
    expect(K.leeftijd(a, a.t1)).toBe(123);
    expect(K.leeftijd(P("mozes"), a.t1)).toBe(120);
    expect(K.jaarTekst(a.t1, M.as)).toBe("jaar 120");
    expect(K.overlap(a, P("mozes"))).toMatchObject({ jaren: 120, ongeveer: false });
  });
  it("Kaleb was veertig bij de verspieding (Jozua 14:7) en 85 vijfenveertig jaar later (Jozua 14:10)", () => {
    const k = P("kaleb");
    expect(K.leeftijd(k, E("verspieders").t)).toBe(40);
    expect(D.personen.find((p: { id: string }) => p.id === "kaleb").tot).toMatchObject({ jaar: 126, einde: "leeft door" });
    expect(126 - D.personen.find((p: { id: string }) => p.id === "kaleb").van.jaar).toBe(85);
  });
  it("geen verzonnen geboortejaar: Mirjam, Jethro, Zippora en Jozua beginnen waar de Bijbel ze noemt, zonder leeftijd", () => {
    for (const id of ["mirjam", "jethro", "zippora", "jozua"]) {
      const p = D.personen.find((x: { id: string }) => x.id === id);
      expect(p.van.jaar, id).toBeNull();
      expect(p.van.begin, id).toBe("genoemd");
      expect(K.leeftijd(P(id), 100), id).toBeNull();
    }
    expect(P("mirjam").t0).toBe(0); // ‘zijn zuster’ bij het kistje (Exodus 2:4)
    expect(D.personen.find((p: { id: string }) => p.id === "mirjam").tot).toMatchObject({ status: "benaderd", marge: [119, 120] });
    expect(P("jozua").einde).toBe("leeft door");
  });
  it("de ijkpunten staan in het juiste levensjaar en op de volgorde van de Bijbel", () => {
    const want: [string, number][] = [["geboorte", 0], ["vlucht", 40], ["braamstruik", 80], ["voor-farao", 80], ["uittocht", 80], ["schelfzee", 80], ["manna", 80], ["amalek", 80],
      ["sinai-wet", 80], ["gouden-kalf", 80], ["tabernakel", 81], ["vertrek-sinai", 81], ["verspieders", 81], ["mirjam-sterft", 119], ["aaron-sterft", 120], ["koperen-slang", 120],
      ["velden-moab", 120], ["afscheid", 120], ["mozes-sterft", 120]];
    for (const [id, j] of want) expect(jaar(E(id).t), id).toBe(j);
    const volgorde = want.map(([id]) => E(id).t);
    expect(volgorde).toEqual([...volgorde].sort((a, b) => a - b));
    const veertig = E("veertig-jaar");
    expect([jaar(veertig.t), jaar(veertig.t2)]).toEqual([81, 119]);
  });
  it("elk gegeven heeft status en bron; maanden na de uittocht staan als ‘berekend’ met hun vers", () => {
    for (const e of D.gebeurtenissen) { expect(["expliciet", "berekend", "benaderd"], e.id).toContain(e.status); expect(e.bron, e.id).toBeTruthy(); }
    const bron = (id: string) => [D.gebeurtenissen.find((e: { id: string }) => e.id === id).bron].flat().join(" ");
    expect(bron("uittocht")).toMatch(/Numeri 33:3/);
    expect(bron("sinai-wet")).toMatch(/Exodus 19:1/);
    expect(bron("tabernakel")).toMatch(/Exodus 40:17/);
    expect(bron("vertrek-sinai")).toMatch(/Numeri 10:11/);
    expect(bron("aaron-sterft")).toMatch(/Numeri 33:38/);
    expect(bron("afscheid")).toMatch(/Deuteronomium 1:3/);
  });
});

describe("wereld mozes: koppelingen, kaart en reis", () => {
  it("alle geschiedenissen van Exodus 1 tot Deuteronomium 34 (v21–v36) zijn gekoppeld, in volgorde, en staan in het register", () => {
    const ids = D.koppelingen.map((k: { verhaal: string }) => k.verhaal);
    expect(ids).toEqual(Array.from({ length: 16 }, (_, i) => "v" + (21 + i)));
    const jaren = D.koppelingen.map((k: { jaar: number }) => k.jaar);
    expect(jaren).toEqual([...jaren].sort((a: number, b: number) => a - b));
    for (const g of BR.geschiedenissen.filter((x) => /^(Exodus|Leviticus|Numeri|Deuteronomium)/.test(x.ref))) expect(ids, `v${g.nr} ${g.t}`).toContain("v" + g.nr);
    const ingang = readFileSync(join(WERELD, "ingang.js"), "utf8");
    expect(ingang).toMatch(/"mozes":\{"titel":"Mozes, Egypte en de woestijnreis","verhalen":\{"v21":0,/);
  });
  it("geen politieke grenzen: alleen landstreken (‘streek’, benaderd, zonder rijk of farao), geldige ringen", () => {
    expect(D.gebieden.map((g: { id: string }) => g.id)).toEqual(["egypte", "sinai", "midian", "edom", "moab", "kanaan"]);
    for (const g of D.gebieden) {
      expect(g.soort, g.id).toBe("streek");
      expect(g.hoofdstad, g.id).toBeUndefined();
      expect(g.naam, g.id).not.toMatch(/rijk|farao/i);
      for (const s of g.sleutels) {
        expect(s.betrouwbaarheid).toBe("benaderd");
        const r = s.geometrie.coordinates[0];
        expect(r[0]).toEqual(r[r.length - 1]);
        expect(r.length).toBeGreaterThanOrEqual(8);
      }
      expect(g.sleutels.map((s: { jaar: number }) => s.jaar)).toEqual([0, 120]);
    }
  });
  it("de steden zijn legerplaatsen uit plaatsen.js, met de bestaande zekerheid (Sinaï, Schelfzee en Hor betwist)", () => {
    for (const s of D.steden) { expect(BR.plaatsen[s.plaatsId], s.id).toBeTruthy(); expect(s.lat, s.id).toBeUndefined(); }
    for (const id of ["sinai", "schelfzee", "hor"]) { expect(BR.plaatsen[id].c).toBe("b"); expect((BR.plaatsen[id].alt || []).length).toBeGreaterThan(0); }
  });
  it("de reis komt uit de reisstappen van de atlas (Exodus en Numeri), van Raämses tot de berg Nebo", () => {
    const R = M.reis;
    expect(R.delen.length).toBe(D.reis.delen.length);
    for (const d of R.delen) {
      const s = STAPPEN.get(d.stap)!;
      expect(s, d.stap).toBeTruthy();
      expect(d.stukken.length).toBeGreaterThan(0);
      expect(d.len).toBeGreaterThan(0);
    }
    const ll = (k: string) => BR.plaatsen[k].ll;
    expect(K.reisOp(R, 0).ll).toEqual(ll("ramses"));
    expect(K.reisOp(R, E("schelfzee").t).ll).toEqual(ll("schelfzee"));
    expect(K.reisOp(R, E("sinai-wet").t).ll).toEqual(ll("sinai"));
    expect(K.reisOp(R, E("verspieders").t).ll).toEqual(ll("kadesbarnea"));
    expect(K.reisOp(R, E("aaron-sterft").t).ll).toEqual(ll("hor"));
    expect(K.reisOp(R, 120).ll).toEqual(ll("nebo"));
    // 38 jaar: de plek is niet bekend (de reiziger ‘zwerft’), en hij loopt dan niet.
    const z = K.reisOp(R, 100);
    expect(z.zwerft).toBeTruthy();
    expect(z.lopend).toBe(false);
    // Halverwege een deel: een punt op de lijn, het afgelegde stuk eindigt daar.
    const d = R.delen.findIndex((x) => x.stap === "exodus:uittocht:7"), mid = (R.delen[d].t0 + R.delen[d].t1) / 2;
    const h = K.reisOp(R, mid);
    expect(h.i).toBe(d); expect(h.lopend).toBe(true); expect(h.f).toBeCloseTo(0.5, 5);
    const af = K.afgelegd(R.delen[d], 0.5).flatMap((s) => s.pts);
    expect(af[af.length - 1]).toEqual(h.ll);
    // De eigen tochten van Mozes (vlucht, Horeb, terug) zijn apart gemarkeerd.
    expect(R.delen.filter((x) => x.alleen).map((x) => x.stap)).toEqual(["exodus:mozes:2", "exodus:mozes:4", "exodus:mozes:6"]);
  });
  it("de drukke stukken lopen rustiger (as.tempo), met de uittocht het langzaamst", () => {
    const uittocht = M.tempo.find((z) => z.t0 <= E("uittocht").t && z.t1 >= E("sinai-wet").t)!;
    expect(uittocht.factor).toBe(Math.min(...M.tempo.map((z) => z.factor)));
  });
});

describe("wereld mozes: tekst", () => {
  const teksten: [string, string][] = [];
  const verzamel = (naam: string, x: unknown) => {
    if (typeof x === "string") teksten.push([naam, x]);
    else if (Array.isArray(x)) x.forEach((y, i) => verzamel(`${naam}[${i}]`, y));
    else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (k !== "geometrie") verzamel(`${naam}.${k}`, v);
  };
  verzamel("", D);
  it("korte citaten tussen ‘…’ zijn letterlijk Statenvertaling, met de verwijzing erachter", () => {
    let n = 0;
    for (const [naam, t] of teksten) for (const m of t.matchAll(/‘([^’]+)’/g)) {
      n++;
      const ref = t.slice((m.index ?? 0) + m[0].length).match(/\(([1-3]?\s?[A-Za-zëéïü]+ \d+:\d+(?:[–-]\d+)?)\)/);
      expect(ref, `${naam}: citaat zonder verwijzing: ${m[1]}`).not.toBeNull();
      expect(fold(verzen(ref![1]) || ""), `${naam}: ‘${m[1]}’ staat niet in ${ref![1]}`).toContain(fold(m[1]));
      expect(m[1].split(/\s+/).length, `${naam}: citaat te lang`).toBeLessThanOrEqual(12);
    }
    expect(n).toBeGreaterThan(10);
  });
  it("de controleregels (scripts/bijbel-controle/wereld-mozes.txt) kloppen en dekken elk citaat", () => {
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", "wereld-mozes.txt"), "utf8").split("\n").map((r) => r.trim()).filter((r) => r && !r.startsWith("#"));
    expect(regels.length).toBeGreaterThanOrEqual(40);
    for (const r of regels) {
      const [ref, re] = r.split(" | ");
      expect(fold(verzen(ref) || ""), r).toMatch(new RegExp(fold(re), "i"));
    }
    const gedekt = regels.map((r) => fold(r.split(" | ")[1]));
    for (const [naam, t] of teksten) for (const m of t.matchAll(/‘([^’]+)’/g)) expect(gedekt, `${naam}: geen controleregel voor ‘${m[1]}’`).toContain(fold(m[1]));
  });
  it("geen farao bij naam, geen jaartal v.Chr. buiten de uitleg over de datering, geen engel als figuur", () => {
    for (const [naam, t] of teksten) {
      expect(t, naam).not.toMatch(/Thoetmos|Thutmos|Amenho|Ramses II|Ramesses II|Merneptah|Toetanchamon|Achnaton|Hatsjepsoet/i);
      expect(t, naam).not.toMatch(/\bengel(en)?\b/i);
      if (/v\.Chr\./.test(t)) expect(naam, t).toMatch(/^\.info\[(0|2)\]\.tekst$/);
    }
  });
  it("namen zoals de Bijbelreis ze schrijft (personen.js)", () => {
    for (const p of D.personen) expect(BR.mensen[p.personenId].n, p.id).toBe(p.naam);
  });
});

describe("wereld kern: de as ‘leeftijd’ verandert niets aan de andere assen", () => {
  it("am telt af (floor), leeftijd rondt af; een bekende geboorte vóór de as geeft toch een leeftijd", () => {
    const basis = (soort: string) => ({ id: "t", titel: "t", as: { soort, wie: "X", van: 0, tot: 100, stap: 1 }, personen: [{ id: "a", naam: "A", van: { jaar: -3, status: "berekend", bron: "Exodus 7:7" }, tot: { jaar: 50.6, status: "berekend", bron: "Exodus 7:7" } }, { id: "b", naam: "B", van: { jaar: 10, status: "berekend", bron: "Exodus 7:7" }, tot: { jaar: 90, status: "berekend", bron: "Exodus 7:7" } }] });
    const am = K.bereid(basis("am")), lt = K.bereid(basis("leeftijd"));
    expect(K.leeftijd(am.byId.get("b")!, 30.7)).toBe(20);
    expect(K.leeftijd(lt.byId.get("b")!, 30.7)).toBe(21);
    expect(K.leeftijd(lt.byId.get("a")!, 30)).toBe(33);
    expect(K.leeftijd(am.byId.get("a")!, 30)).toBe(33); // ook op een gewone as: de geboorte is bekend
    expect(K.telt({ soort: "am" }) && K.telt({ soort: "leeftijd" }) && !K.telt({ soort: "vchr" })).toBe(true);
    expect(K.jaarTekst(-3, { soort: "am" })).toBe("jaar -3");
    expect(K.controleer({ ...basis("leeftijd"), as: { soort: "leeftijd", van: 0, tot: 100 } })).toContain("as: een leeftijd-as noemt wie (as.wie)");
  });
  it("de controle vindt fouten in een reis en in tempo", () => {
    const d = structuredClone(D);
    d.reis.delen[0].stap = "exodus:bestaat-niet:0"; d.reis.delen[1].r = [9]; d.reis.delen[3].van = 10; d.as.tempo[0].factor = 2; d.gebieden[0].soort = "rijk";
    const f = K.controleer(d, REFS).join("\n");
    for (const m of ["reisstap bestaat niet", "heeft geen route 9", "niet op volgorde", "as.tempo 0", "soort ‘rijk’"]) expect(f).toContain(m);
  });
});
