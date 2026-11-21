// ‘De wereld in die tijd’ (docs/bijbelreis-wereld/README.md): de rekenkern (public/bijbelreis/wereld/kern.js), de
// periodebestanden (public/bijbelreis/wereld/perioden/*.json), het register in ingang.js en de plaats in de app-schil.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error -- gewoon JavaScript-bestand zonder typen
import { maakPwa, stempel } from "../scripts/bijbelreis-pwa.mjs";

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const WERELD = join(PUB, "bijbelreis", "wereld");

// De atlas zoals de pagina hem laadt (plaatsen, personen, geschiedenissen, verwijzingen), zonder Leaflet en app.js.
type Br = Record<string, unknown> & { plaatsen: Record<string, { ll: [number, number]; c?: string }>; mensen: Record<string, unknown>; geschiedenissen: { nr: number }[]; parseRef: (r: string) => { ranges: { slug: string; c1: number; v1: number; c2: number; v2: number }[] } | null };
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
const ctx: { window: { BR?: Br } } = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
runInNewContext(readFileSync(join(WERELD, "kern.js"), "utf8"), ctx);
const BR = ctx.window.BR as Br;
type Persoon = { id: string; naam: string; t0: number; t1: number; einde: string; rij: number; beginOnzeker: boolean; eindOnzeker: boolean; van: { jaar: number | null; vaderLeeftijd?: number; bron: string }; tot: { jaar: number | null; leeftijd?: number; bron: string }; ouder: string | null };
type Kern = {
  naarT: (j: number, as: object) => number; naarJaar: (t: number, as: object) => number; bereik: (as: object) => [number, number];
  jaarTekst: (t: number, as: object, kort?: boolean) => string; schaal: (t0: number, t1: number, x0: number, x1: number) => { x: (t: number) => number; t: (x: number) => number; k: number };
  streepjes: (t0: number, t1: number, px: number, min?: number) => { stap: number; ticks: number[] };
  zoom: (v: [number, number], f: number, rond: number, grens: [number, number], min?: number) => [number, number];
  schuif: (v: [number, number], dt: number, grens: [number, number]) => [number, number];
  herbemonster: (r: number[][], n?: number) => number[][]; oppervlak: (r: number[][]) => number; lijnUit: (a: number[][], b: number[][]) => number[][];
  bereid: (d: unknown, ctx?: object) => { as: object; tMin: number; tMax: number; personen: Persoon[]; byId: Map<string, Persoon>; gebeurtenissen: { id: string; t: number; t2: number }[]; gebieden: unknown[]; vervaag: number; heeftKaart: boolean };
  gebiedOp: (g: unknown, t: number, v: number) => { dekking: number; betrouwbaarheid: string; delen: number[][][] } | null;
  leeftNog: (p: Persoon, t: number) => boolean; leeftijd: (p: Persoon, t: number) => number | null;
  overlap: (a: Persoon, b: Persoon) => { jaren: number; van: number | null; tot: number | null; minstens: boolean; ongeveer: boolean; tussen?: number };
  momenten: (m: unknown) => { t: number; soort: string }[];
  rijInBeeld: (p: Persoon[], t: number, rh: number, hoogte: number, nu: number) => number | null;
  controleer: (d: unknown, refs?: object) => string[]; PUNTEN: number;
};
const K = BR.wereldKern as unknown as Kern;

// Bestaat een Bijbelverwijzing in de Statenvertaling (data/statenvertaling)?
const SV: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function refOk(ref: string): boolean {
  const q = BR.parseRef(ref);
  if (!q) return false;
  return q.ranges.every((r) => {
    const f = join(ROOT, "data", "statenvertaling", r.slug + ".json");
    if (!existsSync(f)) return false;
    SV[r.slug] ??= JSON.parse(readFileSync(f, "utf8"));
    const H = SV[r.slug].hoofdstukken, c2 = r.c2 === 999 ? Object.keys(H).length : r.c2;
    return !!H[r.c1] && !!H[c2] && r.v1 <= H[r.c1].length && (r.v2 === 999 || r.v2 <= H[c2].length);
  });
}
// W en stappen: de tussenpunten en reisstappen van de atlas, voor een periode met een reis (mozes).
const REFS = { plaatsen: BR.plaatsen, W: BR.W, stappen: (BR.wereldKern as unknown as { stappenVan: (b: unknown) => unknown }).stappenVan(BR.boeken), mensen: BR.mensen, verhalen: new Set(BR.geschiedenissen.map((g) => "v" + g.nr)), refOk };
const PERIODEN = readdirSync(join(WERELD, "perioden")).filter((f) => f.endsWith(".json"));
const lees = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const FIXTURE = lees(join(ROOT, "tests", "fixtures", "wereld", "test-kaart.json"));

describe("wereld: de periodebestanden", () => {
  it("er is minstens de periode adam-noach", () => expect(PERIODEN).toContain("adam-noach.json"));
  for (const f of PERIODEN) {
    it(`${f}: elk gegeven heeft status en bron; elke verwijzing (Bijbel, plaats, persoon, geschiedenis) bestaat`, () => {
      const d = lees(join(WERELD, "perioden", f));
      expect(d.id + ".json").toBe(f);
      expect(K.controleer(d, REFS)).toEqual([]);
    });
  }
  it("de testdata (tests/fixtures/wereld) is geldig volgens dezelfde controle", () => {
    expect(FIXTURE.titel).toMatch(/TESTDATA/);
    expect(K.controleer(FIXTURE, REFS)).toEqual([]);
  });
  it("de controle vindt fouten: geen status, geen bron, onbekende verwijzingen, kapotte geometrie", () => {
    const d = structuredClone(lees(join(WERELD, "perioden", "adam-noach.json")));
    d.personen[0].van.status = "zeker"; delete d.personen[1].tot.bron; d.personen[2].ouder = "niemand"; d.personen[3].verhaal = "v999";
    d.gebeurtenissen[0].plaats = "bestaat-niet"; d.koppelingen[0].verhaal = "v0";
    d.gebieden = [{ id: "x", naam: "X", bron: ["sv"], sleutels: [{ jaar: 10, betrouwbaarheid: "benaderd", geometrie: { type: "Polygon", coordinates: [[[0, 0], [1, 1]]] } }] }];
    const f = K.controleer(d, REFS).join("\n");
    for (const m of ["status ‘zeker’", "seth.tot: bron ontbreekt", "ouder ‘niemand’", "verhaal ‘v999’", "plaats ‘bestaat-niet’", "koppeling 0: verhaal ‘v0’", "geen geldige geometrie"]) expect(f).toContain(m);
    expect(K.controleer({ id: "x", titel: "x" })).toEqual(["as ontbreekt of is ongeldig"]);
  });
  it("het register in ingang.js is bijgewerkt (node scripts/bijbelreis-wereld.mjs)", () => {
    expect(execFileSync(process.execPath, [join(ROOT, "scripts", "bijbelreis-wereld.mjs"), "--controle"], { encoding: "utf8" })).toContain("register klopt");
  });
});

describe("wereld: Van Adam tot Abram rekent goed (Masoretische tekst = Statenvertaling)", () => {
  const D = lees(join(WERELD, "perioden", "adam-noach.json"));
  const M = K.bereid(D, { plaatsen: BR.plaatsen });
  const P = (id: string) => M.byId.get(id)!;
  const jaar = (id: string, k: "van" | "tot") => P(id)[k].jaar as number;
  it("elk geboortejaar is het geboortejaar van de vader plus zijn leeftijd bij de geboorte; elk einde is geboorte plus leeftijd", () => {
    // De keten zelf, onafhankelijk van wat in het bestand staat: Genesis 5 (vader bij de geboorte, levensduur).
    const keten: [string, number, number][] = [["adam", 130, 930], ["seth", 105, 912], ["enos", 90, 905], ["kenan", 70, 910], ["mahalaleel", 65, 895], ["jered", 162, 962], ["henoch", 65, 365], ["methusalach", 187, 969], ["lamech", 182, 777], ["noach", 500, 950]];
    let geboren = 0;
    keten.forEach(([id, vader, leeftijd], i) => {
      expect(jaar(id, "van"), id).toBe(geboren);
      expect(jaar(id, "tot"), id).toBe(geboren + leeftijd);
      if (i) expect(P(id).van.vaderLeeftijd, id).toBe(keten[i - 1][1]);
      expect(P(id).tot.leeftijd, id).toBe(leeftijd);
      geboren += vader;
    });
    for (const p of M.personen) if (p.van.vaderLeeftijd != null && p.ouder) expect(p.van.jaar, p.id).toBe((P(p.ouder).van.jaar as number) + p.van.vaderLeeftijd);
  });
  it("ijkpunten: zondvloed 1656, Methusalach sterft in 1656, Henoch weggenomen in 987, Noach sterft in 2006", () => {
    const vloed = jaar("noach", "van") + 600; // Genesis 7:6
    expect(vloed).toBe(1656);
    expect(D.gebeurtenissen.find((e: { id: string }) => e.id === "zondvloed").jaar).toBe(vloed);
    expect(D.gebeurtenissen.find((e: { id: string }) => e.id === "zondvloed").tot).toBe(vloed + 1); // Genesis 8:13: het 601e jaar
    expect(jaar("methusalach", "tot")).toBe(vloed);
    expect(jaar("henoch", "tot")).toBe(987);
    expect(P("henoch").einde).toBe("weggenomen");
    expect(jaar("noach", "tot")).toBe(vloed + 350); // Genesis 9:28
    expect(jaar("noach", "tot")).toBe(2006);
    expect(jaar("lamech", "tot")).toBe(1651);
  });
  it("Sem: honderd jaar, twee jaar na de vloed (Genesis 11:10); daarna nog vijfhonderd (11:11)", () => {
    expect(jaar("sem", "van")).toBe(1656 + 2 - 100);
    expect(jaar("sem", "tot")).toBe(1558 + 100 + 500);
    expect(P("sem").van.vaderLeeftijd).toBe(1558 - 1056);
    // Cham en Jafeth: geboortejaar bij benadering (Genesis 5:32), einde onbekend.
    for (const id of ["cham", "jafeth"]) { expect(P(id).beginOnzeker).toBe(true); expect(P(id).einde).toBe("onbekend"); }
  });
  it("tegelijk: Adam en Methusalach 243 jaar; Adam en Noach niet (126 jaar ertussen); Noach en Cham minstens", () => {
    const am = K.overlap(P("adam"), P("methusalach"));
    expect(am.jaren).toBe(243);
    expect([am.van, am.tot]).toEqual([687, 930]);
    expect(am.minstens || am.ongeveer).toBe(false);
    const an = K.overlap(P("adam"), P("noach"));
    expect(an.jaren).toBe(0);
    expect(an.tussen).toBe(126);
    expect(K.overlap(P("adam"), P("lamech")).jaren).toBe(56);
    expect(K.overlap(P("noach"), P("sem")).jaren).toBe(448);
    expect(K.overlap(P("noach"), P("cham")).minstens).toBe(true);
    expect(K.overlap(P("henoch"), P("adam")).jaren).toBe(308);
  });
  it("bij de dood van Adam leven al zijn nakomelingen in deze lijn tot en met Lamech (de tekst van de gebeurtenis)", () => {
    const leven = M.personen.filter((p) => p.id !== "adam" && K.leeftNog(p, 930)).map((p) => p.id);
    expect(leven).toEqual(["seth", "enos", "kenan", "mahalaleel", "jered", "henoch", "methusalach", "lamech"]);
    expect(K.leeftNog(P("adam"), 930)).toBe(false);
    expect(K.leeftNog(P("adam"), 929)).toBe(true);
    expect(K.leeftijd(P("methusalach"), 1000)).toBe(313);
  });
  it("elk getal en citaat staat in de Statenvertaling (scripts/bijbel-controle/wereld-adam-noach.txt), en elke bron-vers heeft een regel", () => {
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", "wereld-adam-noach.txt"), "utf8").split("\n").filter((r) => r.trim() && !r.startsWith("#"));
    const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    for (const r of regels) {
      const [ref, re] = r.split(" | ");
      const q = BR.parseRef(ref)!;
      expect(q, ref).toBeTruthy();
      const rg = q.ranges[0];
      SV[rg.slug] ??= JSON.parse(readFileSync(join(ROOT, "data", "statenvertaling", rg.slug + ".json"), "utf8"));
      const tekst = SV[rg.slug].hoofdstukken[rg.c1].slice(rg.v1 - 1, rg.v2).join(" ");
      expect(fold(tekst), r).toMatch(new RegExp(fold(re), "i"));
    }
    const gedekt = new Set(regels.map((r) => r.split(" | ")[0]));
    for (const p of M.personen) for (const b of [p.van.bron, p.tot.bron].flat() as string[]) {
      const q = BR.parseRef(b)!;
      expect(q, `${p.id}: ${b}`).toBeTruthy();
      for (const rg of q.ranges) expect([...gedekt].some((g) => { const x = BR.parseRef(g)!.ranges[0]; return x.slug === rg.slug && x.c1 === rg.c1 && x.v1 >= rg.v1 && x.v1 <= rg.v2; }), `${p.id}: ${b}`).toBe(true);
    }
  });
  it("letterlijke citaten tussen ‘…’ staan zo in de Statenvertaling; geen HSV-namen buiten personen.js", () => {
    const tekst = JSON.stringify({ ...D, bronnen: [] });
    const citaten = [...tekst.matchAll(/‘([^’]+)’/g)].map((m) => m[1]);
    expect(citaten.length).toBeGreaterThan(3);
    const alles = ["genesis", "hebreeen", "handelingen"].map((b) => Object.values((SV[b] ??= JSON.parse(readFileSync(join(ROOT, "data", "statenvertaling", b + ".json"), "utf8"))).hoofdstukken).flat().join(" ")).join(" ");
    for (const c of citaten) expect(alles.toLowerCase(), c).toContain(c.toLowerCase());
    // Namen zoals de Bijbelreis ze schrijft (personen.js): de naam, een alias (Abram) of de naam zonder toevoeging
    // (‘Nahor (opa)’ heet in deze tijdlijn gewoon Nahor: zijn kleinzoon Nahor staat er niet in).
    for (const p of M.personen) {
      const id = (p as unknown as { personenId?: string }).personenId;
      if (!id) continue;
      const m = BR.mensen[id] as { n: string; alias?: string[] };
      expect([m.n, m.n.replace(/ \(.*\)$/, ""), ...(m.alias || [])], p.id).toContain(p.naam);
    }
  });
  it("Genesis 11:10–32: elk geboorte- en sterfjaar van Sem tot Abram, nagerekend uit de verzen", () => {
    // [id, leeftijd van de vader bij de geboorte van deze zoon, leeftijd bij de geboorte van zijn eigen zoon, jaren daarna]
    // Genesis 11:10–25; Terach: 205 jaar in totaal (11:32).
    const keten: [string, number, number, number][] = [
      ["sem", 502, 100, 500], ["arfachsad", 100, 35, 403], ["selah", 35, 30, 403], ["heber", 30, 34, 430], ["peleg", 34, 30, 209],
      ["rehu", 30, 32, 207], ["serug", 32, 30, 200], ["nahor", 30, 29, 119],
    ];
    let geboren = 1656 + 2 - 100; // Sem was honderd ‘twee jaren na den vloed’ (11:10)
    for (const [id, vader, zoon, daarna] of keten) {
      expect(jaar(id, "van"), id).toBe(geboren);
      expect(P(id).van.vaderLeeftijd, id).toBe(vader);
      expect(jaar(id, "tot"), id).toBe(geboren + zoon + daarna);
      expect(P(id).tot.leeftijd, id).toBe(zoon + daarna);
      geboren += zoon;
    }
    expect(jaar("arfachsad", "van")).toBe(1658);
    expect(jaar("terach", "van")).toBe(1878);
    expect(jaar("terach", "tot")).toBe(1878 + 205); // Genesis 11:32
    expect(P("terach").tot.leeftijd).toBe(205);
    // Abram: 75 toen hij uit Haran trok (12:4), nadat Terach gestorven was (Handelingen 7:4): Terach was dan 130.
    expect(jaar("abram", "van")).toBe(jaar("terach", "tot") - 75);
    expect(jaar("abram", "van")).toBe(2008);
    expect(P("abram").van.vaderLeeftijd).toBe(130);
    expect(jaar("abram", "tot")).toBe(2008 + 175); // Genesis 25:7
    // De andere lezing (Terach zeventig, Genesis 11:26) staat als opmerking, niet als lijn.
    expect(1878 + 70).toBe(1948);
    expect((P("abram").van as unknown as { opmerking: string }).opmerking).toMatch(/1948/);
    expect((D.info as { kop: string; tekst: string }[]).find((i) => /Terach 130 of 70/.test(i.kop))!.tekst).toMatch(/2008.*1948.*zestig jaar/);
    const e = (id: string) => D.gebeurtenissen.find((x: { id: string }) => x.id === id);
    expect(e("geboorte-arfachsad").jaar).toBe(1658);
    expect(e("geboorte-abram").jaar).toBe(2008);
    expect(e("abram-uit-haran").jaar).toBe(2083);
    // Geen andere zonen van Terach: Genesis 11 geeft voor Nahor en Haran geen getallen.
    expect(M.personen.filter((p) => p.ouder === "terach").map((p) => p.id)).toEqual(["abram"]);
  });
  it("uitgerekend tegelijk: bij de geboorte van Abram leven Sem tot en met Terach nog, behalve Peleg en Nahor (de tekst van de gebeurtenis)", () => {
    const leven = M.personen.filter((p) => p.id !== "abram" && K.leeftNog(p, 2008)).map((p) => p.id);
    expect(leven).toEqual(["sem", "arfachsad", "selah", "heber", "rehu", "serug", "terach"]);
    expect(jaar("noach", "tot")).toBe(2008 - 2);
    expect(K.overlap(P("noach"), P("abram")).tussen).toBe(2);
    expect(K.overlap(P("sem"), P("abram")).jaren).toBe(150);
    expect(K.overlap(P("heber"), P("abram")).jaren).toBe(175); // Heber leeft nog vier jaar na Abram
    expect(K.leeftNog(P("peleg"), 2008) || K.leeftNog(P("nahor"), 2008)).toBe(false);
    // Geen verzonnen ontmoetingen: alleen uitgerekende jaren.
    expect(JSON.stringify(D)).not.toMatch(/sprak met|ontmoette|vertelde aan/);
  });
  it("Septuagint na de zondvloed: Kaïnan en de hogere getallen, nagerekend (Brenton, Genesis 11)", () => {
    const info = (D.info as { kop: string; tekst: string; status: string; bron: string[] }[]).find((i) => /Kaïnan/.test(i.kop))!;
    expect(info.status).toBe("historisch");
    expect(info.bron).toContain("brenton-gen11");
    expect(info.tekst).toMatch(/Lukas 3:36/);
    // Vader bij de geboorte van de zoon, van Arfachsad tot en met Terach: Masoretische tekst en Septuagint (met Kaïnan).
    const mt = [35, 30, 34, 30, 32, 30, 29, 70], lxx = [135, 130, 130, 134, 130, 132, 130, 179, 70];
    const som = (a: number[]) => a.reduce((s, x) => s + x, 0);
    expect(som(lxx) - som(mt)).toBe(880);
    expect(som(lxx) - 100 - som(mt)).toBe(780); // Codex Alexandrinus: Nahor 79
    expect(info.tekst).toMatch(/880 of 780/);
    expect(info.tekst).toMatch(/179.*79/);
  });
  it("koppelingen: Babel (v7) zonder jaartal als band met uitleg, Abram (v8) in het jaar dat hij uit Haran trekt", () => {
    const k = (v: string) => D.koppelingen.find((x: { verhaal: string }) => x.verhaal === v);
    expect(k("v7").status).toBe("benaderd");
    expect([k("v7").jaar, k("v7").tot]).toEqual([1657, 2008]);
    expect(k("v7").opmerking).toMatch(/geen jaar/);
    expect(k("v8").jaar).toBe(jaar("terach", "tot"));
    for (const v of ["v2", "v4", "v5", "v6"]) expect(k(v), v).toBeTruthy();
    expect(D.id).toBe("adam-noach");
    expect(D.titel).toBe("Van Adam tot Abram");
  });
  it("de lijst schuift mee naar wie er leeft als hij niet past (telefoon: 8 van de 22 rijen in beeld)", () => {
    const rh = 34, h = 273; // gemeten op 390 × 664
    expect(K.rijInBeeld(M.personen, 0, rh, h, 0)).toBeNull(); // Adam staat bovenaan
    expect(K.rijInBeeld(M.personen, 987, rh, h, 0)).toBe(9 * rh - h); // Seth t/m Lamech (rij 1–8): Adam schuift weg
    // In 2008 leven Sem (rij 12) t/m Abram (rij 21): past niet, dus de jongste rij onderaan.
    expect(K.rijInBeeld(M.personen, 2008, rh, h, 0)).toBe(22 * rh - h);
    expect(K.rijInBeeld(M.personen, 2008, rh, h, 22 * rh - h)).toBeNull();
    // Terug naar het begin: zo weinig mogelijk schuiven, de bovenste levende rij bovenaan.
    expect(K.rijInBeeld(M.personen, 130, rh, h, 400)).toBe(0);
    expect(K.rijInBeeld(M.personen, 1656, rh, h, 0)).toBe(13 * rh - h); // Jered t/m Sem
    // Past alles, of is er niets: niets doen.
    expect(K.rijInBeeld(M.personen, 2008, 20, 1000, 0)).toBeNull();
    expect(K.rijInBeeld(M.personen, 2008, rh, 0, 0)).toBeNull();
  });
  it("geen kaart voor deze periode, wel een uitleg waarom", () => {
    expect(M.heeftKaart).toBe(false);
    expect(D.kaartUitleg).toMatch(/Ararat/);
  });
  it("geen jaartallen v.Chr. en geen Ussher (besluit 21-11-2026); de Septuagint en Samaritaanse Pentateuch als compacte info", () => {
    const info = D.info as { kop: string; tekst: string; status: string }[];
    expect(JSON.stringify(D)).not.toMatch(/Ussher|4004|2348/);
    expect(JSON.stringify(D)).not.toMatch(/\d+ v\.Chr\./);
    expect(info.find((i) => /Septuagint/.test(i.tekst))!.tekst).toMatch(/2242 of 2262.*1307/);
    // Septuagint en Samaritaanse Pentateuch, nagerekend: vader bij de geboorte van de zoon tot en met Noach 600.
    const lxx = [230, 205, 190, 170, 165, 162, 165, 167, 188], sp = [130, 105, 90, 70, 65, 62, 65, 67, 53];
    const som = (a: number[]) => a.reduce((s, x) => s + x, 0) + 600;
    expect(som(lxx)).toBe(2242);
    expect(som(lxx) + 20).toBe(2262);
    expect(som(sp)).toBe(1307);
  });
});

describe("wereld: tijdas", () => {
  const am = { soort: "am", van: 0, tot: 2200 }, vchr = { soort: "vchr", van: 626, tot: 520 };
  it("v.Chr. loopt van groot naar klein; intern loopt de tijd vooruit", () => {
    expect(K.bereik(vchr)).toEqual([-626, -520]);
    expect(K.naarT(539, vchr)).toBe(-539);
    expect(K.naarJaar(-539, vchr)).toBe(539);
    expect(K.naarT(987, am)).toBe(987);
  });
  it("jaartallen zoals een mens ze leest (geen jaar 0)", () => {
    expect(K.jaarTekst(987, am)).toBe("jaar 987");
    expect(K.jaarTekst(987, am, true)).toBe("987");
    expect(K.jaarTekst(-539, vchr)).toBe("539 v.Chr.");
    expect(K.jaarTekst(0, vchr)).toBe("1 v.Chr.");
    expect(K.jaarTekst(33, { soort: "nchr", van: 1, tot: 100 })).toBe("33 n.Chr.");
  });
  it("schaal: tijd naar pixels en terug", () => {
    const s = K.schaal(0, 2200, 14, 1014);
    expect(s.x(0)).toBe(14);
    expect(s.x(2200)).toBe(1014);
    expect(s.t(s.x(987))).toBeCloseTo(987, 9);
  });
  it("streepjes op een mooie stap, met genoeg ruimte", () => {
    expect(K.streepjes(0, 2200, 1000 / 2200, 84).stap).toBe(200);
    expect(K.streepjes(0, 2200, 300 / 2200, 56).stap).toBe(500);
    expect(K.streepjes(-626, -520, 8, 60).ticks.every((t) => t % 10 === 0)).toBe(true);
  });
  it("zoomen houdt het punt onder de vinger vast en blijft binnen de as; schuiven ook", () => {
    const v = K.zoom([0, 2200], 2, 1100, [0, 2200], 50);
    expect(v).toEqual([550, 1650]);
    const w = K.zoom([0, 2200], 4, 100, [0, 2200], 50);
    expect(w).toEqual([75, 625]);
    expect(K.zoom([0, 2200], 4, 10, [0, 2200], 50)[0]).toBeGreaterThanOrEqual(0);
    expect(K.zoom([0, 100], 10, 50, [0, 2200], 55)[1] - K.zoom([0, 100], 10, 50, [0, 2200], 55)[0]).toBe(55);
    expect(K.zoom([500, 600], 0.01, 550, [0, 2200], 10)).toEqual([0, 2200]);
    expect(K.schuif([0, 550], -100, [0, 2200])).toEqual([0, 550]);
    expect(K.schuif([0, 550], 2000, [0, 2200])).toEqual([1650, 2200]);
  });
});

describe("wereld: gebieden die met de tijd veranderen", () => {
  const vierkant = (x: number, y: number, z: number) => [[x, y], [x + z, y], [x + z, y + z], [x, y + z], [x, y]];
  it("herbemonsteren: vast aantal punten, gelijk verdeeld, tegen de klok in", () => {
    const r = K.herbemonster([...vierkant(0, 0, 4)].reverse());
    expect(r).toHaveLength(K.PUNTEN);
    expect(K.oppervlak(r)).toBeGreaterThan(0);
    expect(K.oppervlak(r)).toBeCloseTo(16, 0);
    const stap = r.map((p, i) => Math.hypot(r[(i + 1) % r.length][0] - p[0], r[(i + 1) % r.length][1] - p[1]));
    expect(Math.max(...stap) - Math.min(...stap)).toBeLessThan(1e-9 + 16 / K.PUNTEN);
  });
  it("uitlijnen: de punten van de tweede vorm worden zo gedraaid dat ze bij de eerste horen", () => {
    const a = K.herbemonster(vierkant(0, 0, 4)), b = K.herbemonster(vierkant(0, 0, 4));
    const gedraaid = b.slice(17).concat(b.slice(0, 17));
    const terug = K.lijnUit(a, gedraaid);
    expect(terug[0][0]).toBeCloseTo(a[0][0], 9);
    expect(terug[0][1]).toBeCloseTo(a[0][1], 9);
  });
  const M = K.bereid(FIXTURE, { plaatsen: BR.plaatsen });
  const [A, B] = M.gebieden;
  const breedte = (d: number[][][]) => { const lng = d[0].map((p) => p[1]); return Math.max(...lng) - Math.min(...lng); };
  it("op een sleuteljaar precies de vorm van de sleutel; ertussen een vloeiende tussenvorm", () => {
    const op600 = K.gebiedOp(A, -600, M.vervaag)!;
    const op560 = K.gebiedOp(A, -560, M.vervaag)!;
    const op580 = K.gebiedOp(A, -580, M.vervaag)!;
    expect(breedte(op560.delen)).toBeCloseTo(10, 6);
    expect(breedte(op580.delen)).toBeGreaterThan(3);
    expect(breedte(op580.delen)).toBeLessThan(10);
    expect(breedte(op580.delen)).toBeCloseTo(6.5, 6); // halverwege, met een vloeiende (symmetrische) overgang
    expect(op560.betrouwbaarheid).toBe("historisch");
    expect(op600.betrouwbaarheid).toBe("benaderd");
    // [lat, lng] voor Leaflet
    expect(op560.delen[0].every(([lat, lng]) => lat >= 29 - 1e-9 && lat <= 37 + 1e-9 && lng >= 38 - 1e-9 && lng <= 48 + 1e-9)).toBe(true);
  });
  it("een gebied bestaat alleen tussen zijn eerste en laatste sleutel, en komt en gaat vloeiend", () => {
    expect(K.gebiedOp(A, -610, M.vervaag)).toBeNull();
    expect(K.gebiedOp(A, -520, M.vervaag)).toBeNull();
    expect(K.gebiedOp(B, -590, M.vervaag)).toBeNull();
    const begin = K.gebiedOp(B, -581, M.vervaag)!.dekking, midden = K.gebiedOp(B, -560, M.vervaag)!.dekking;
    expect(K.gebiedOp(B, -580, M.vervaag)!.dekking).toBe(1);
    expect(begin).toBeGreaterThan(0);
    expect(begin).toBeLessThan(1);
    expect(midden).toBe(1);
  });
  it("van één vorm naar twee delen (MultiPolygon): het tweede deel groeit uit zijn eigen midden", () => {
    const vlak = K.gebiedOp(B, -575, M.vervaag)!, laat = K.gebiedOp(B, -541, M.vervaag)!;
    expect(vlak.delen).toHaveLength(2);
    const klein = (d: number[][]) => Math.max(...d.map((p) => p[1])) - Math.min(...d.map((p) => p[1]));
    expect(klein(vlak.delen[1])).toBeLessThan(0.5);
    expect(klein(laat.delen[1])).toBeGreaterThan(1.3);
  });
  it("de testdata heeft een kaart; momenten staan op volgorde", () => {
    expect(M.heeftKaart).toBe(true);
    const m = K.momenten(M).map((x) => x.t);
    expect(m).toEqual([...m].sort((a, b) => a - b));
  });
});

describe("wereld: in de app-schil (offline, één versie)", () => {
  let map = "";
  afterEach(() => map && rmSync(map, { recursive: true, force: true }));
  it("kern.js, wereld.js, wereld.css en de perioden krijgen een hash en staan in de schil; ingang.js via de pagina", () => {
    map = mkdtempSync(join(tmpdir(), "bijbelreis-wereld-unit-"));
    const b = (p: string, inhoud: string) => { mkdirSync(join(map, p, ".."), { recursive: true }); writeFileSync(join(map, p), inhoud); };
    b("bijbelreis.html", `<!doctype html><html><head>\n<link rel="manifest" href="/bijbelreis/manifest.webmanifest" />\n  </head><body><script src="/bijbelreis/wereld/ingang.js"></script><script src="/bijbelreis/app.js"></script></body></html>`);
    b("bijbelreis/app.js", "// app\n");
    b("bijbelreis/manifest.webmanifest", "{}");
    for (const p of ["geo.json", "toen.json", "relief.json", "grenzen.json", "relief-regio.webp", "relief-kanaan.webp", "niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]) b("bijbelreis/" + p, p);
    for (const p of ["ingang.js", "kern.js", "wereld.js", "wereld.css", "perioden/adam-noach.json"]) b("bijbelreis/wereld/" + p, "// " + p);
    cpSync(join(PUB, "bijbelreis-sw.js"), join(map, "bijbelreis-sw.js"));
    stempel(map);
    maakPwa(map);
    const h = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 10);
    const pagina = readFileSync(join(map, "bijbelreis.html"), "utf8");
    const data = JSON.parse(pagina.match(/<meta name="bijbelreis-data" content='([^']+)'/)![1]);
    for (const p of ["kern.js", "wereld.js", "wereld.css", "perioden/adam-noach.json"]) expect(data["wereld/" + p], p).toBe(h("// " + p));
    expect(data["wereld/ingang.js"]).toBeUndefined();
    expect(pagina).toContain(`src="/bijbelreis/wereld/ingang.js?v=${h("// ingang.js")}"`);
    const schil = JSON.parse(readFileSync(join(map, "bijbelreis-sw.js"), "utf8").match(/const BOUW = (\{.*\});/)![1]).schil.map(([p]: [string]) => p);
    expect(schil).toContain(`/bijbelreis/wereld/perioden/adam-noach.json?v=${h("// perioden/adam-noach.json")}`);
    expect(schil).toContain(`/bijbelreis/wereld/wereld.js?v=${h("// wereld.js")}`);
  });
});
