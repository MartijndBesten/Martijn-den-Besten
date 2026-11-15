// Het thema Kerst in de Bijbelreis: het seizoen (seizoen.js), en dat een thema geen Bijbelboek is.
// Besluiten: docs/bijbelreis-kerst/README.md. Wat de app op het scherm zet, staat in e2e/bijbelreis-kerst.spec.ts.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const PUB = join(__dirname, "..", "public");
const lees = (f: string) => readFileSync(join(PUB, "bijbelreis", f), "utf8");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]);

type Deel = { id: string; nt?: boolean; short: string; steps: { ref: string }[] };
type Boek = { id: string; n: string; thema?: string; nt?: boolean; delen: Deel[] };
type Seizoen = { kerstTijd: (d?: Date | number | string) => boolean; eersteAdvent: (jaar: number) => Date };
type Dia = { s: string; kaart?: { ot?: number } };
type Pakket = { nt: boolean; titel: string; dias: Dia[] };
type BRt = { boeken: Boek[]; seizoen: Seizoen; boekjeInhoud: { maak: (br: BRt, keuze: Record<string, unknown>) => Pakket | null; lees: (hash: string) => Record<string, unknown> } };

// Dezelfde gegevens als de pagina laadt (zonder kaartmotor en app), plus de inhoud van het boekje.
const ctx: { window: { BR?: BRt } } = { window: {} };
for (const s of scripts.filter((s) => !/^(leaflet|app)\.js$/.test(s)).concat(["boekje-inhoud.js"])) runInNewContext(lees(s).replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BRt;
const { kerstTijd, eersteAdvent } = BR.seizoen;
const dag = (j: number, m: number, d: number, u = 12, min = 0) => new Date(j, m - 1, d, u, min);

describe("seizoen: van de eerste adventszondag tot en met 6 januari", () => {
  it("de eerste adventszondag is de vierde zondag vóór 25 december", () => {
    expect([eersteAdvent(2026).getMonth() + 1, eersteAdvent(2026).getDate()]).toEqual([11, 29]);
    expect([eersteAdvent(2027).getMonth() + 1, eersteAdvent(2027).getDate()]).toEqual([11, 28]);
    // 2022: 25 december is een zondag, dus de vroegste datum; 2023: 25 december is een maandag, dus de laatste.
    expect([eersteAdvent(2022).getMonth() + 1, eersteAdvent(2022).getDate()]).toEqual([11, 27]);
    expect([eersteAdvent(2023).getMonth() + 1, eersteAdvent(2023).getDate()]).toEqual([12, 3]);
    for (let jaar = 2020; jaar <= 2080; jaar++) {
      const a = eersteAdvent(jaar), nr = (a.getMonth() + 1) * 100 + a.getDate();
      expect(a.getDay(), String(jaar)).toBe(0);
      expect(nr >= 1127 && nr <= 1203, `${jaar}: ${nr}`).toBe(true);
      // Precies vier zondagen vóór 25 december: de vierde advent valt op 18 tot en met 24 december.
      const vierde = new Date(jaar, a.getMonth(), a.getDate() + 21);
      expect(vierde.getMonth() === 11 && vierde.getDate() >= 18 && vierde.getDate() <= 24, `${jaar}: vierde advent`).toBe(true);
    }
  });
  it("de grenzen van 2026 en 2027", () => {
    expect(kerstTijd(dag(2026, 11, 28))).toBe(false);
    expect(kerstTijd(dag(2026, 11, 28, 23, 59))).toBe(false);
    expect(kerstTijd(dag(2026, 11, 29, 0, 0))).toBe(true);
    expect(kerstTijd(dag(2026, 11, 29))).toBe(true);
    expect(kerstTijd(dag(2026, 12, 25))).toBe(true);
    expect(kerstTijd(dag(2026, 12, 31, 23, 59))).toBe(true);
    expect(kerstTijd(dag(2027, 1, 1, 0, 0))).toBe(true);
    expect(kerstTijd(dag(2027, 1, 6))).toBe(true);
    expect(kerstTijd(dag(2027, 1, 6, 23, 59))).toBe(true);
    expect(kerstTijd(dag(2027, 1, 7, 0, 0))).toBe(false);
    expect(kerstTijd(dag(2027, 1, 7))).toBe(false);
    expect(kerstTijd(dag(2027, 11, 27))).toBe(false);
    expect(kerstTijd(dag(2027, 11, 28))).toBe(true);
  });
  it("buiten het seizoen: de rest van het jaar", () => {
    expect(kerstTijd(dag(2026, 7, 15))).toBe(false);
    expect(kerstTijd(dag(2027, 3, 1))).toBe(false);
    expect(kerstTijd(dag(2026, 11, 15))).toBe(false);
    for (let m = 2; m <= 10; m++) expect(kerstTijd(dag(2027, m, 15)), `maand ${m}`).toBe(false);
  });
  it("neemt ook een tijdstip of een tekst aan, en zegt nee op een onleesbare datum", () => {
    expect(kerstTijd(dag(2026, 12, 10).getTime())).toBe(true);
    expect(kerstTijd("2026-12-10T10:00:00")).toBe(true);
    expect(kerstTijd("2027-03-01T10:00:00")).toBe(false);
    expect(kerstTijd("geen datum")).toBe(false);
    expect(typeof kerstTijd()).toBe("boolean");
  });
  it("seizoen.js laadt vóór app.js en rekent alleen (geen opslag, netwerk of DOM)", () => {
    expect(scripts.indexOf("seizoen.js")).toBeGreaterThan(-1);
    expect(scripts.indexOf("seizoen.js")).toBeLessThan(scripts.indexOf("app.js"));
    expect(lees("seizoen.js")).not.toMatch(/localStorage|sessionStorage|fetch\(|document\./);
  });
});

describe("een thema staat niet tussen de Bijbelboeken", () => {
  const app = lees("app.js");
  const themas = BR.boeken.filter((b) => b.thema), bijbelboeken = BR.boeken.filter((b) => !b.thema);
  it("Kerst is het enige thema en heeft zes delen", () => {
    expect(themas.map((b) => b.id)).toEqual(["kerst"]);
    expect(themas[0].delen.map((d) => d.id)).toEqual(["kerst-belofte", "kerst-koningen", "kerst-aankondiging", "kerst-geboorte", "kerst-wijzen", "kerst-twaalf"]);
    expect(themas[0].delen.reduce((a, d) => a + d.steps.length, 0)).toBe(59);
  });
  it("de boekenkast telt 66 Bijbelboeken, zonder het thema", () => {
    const kast = [...app.matchAll(/\["(?:Wet|Geschiedenis|Poëzie en wijsheid|Profeten|Evangeliën en Handelingen|Brieven en Openbaring)", "([^"]+)"\]/g)].flatMap((m) => m[1].split(" "));
    expect(kast).toHaveLength(66);
    expect(kast.some((n) => /kerst/i.test(n))).toBe(false);
  });
  it("de boekenrij en het keuzescherm van het boekje nemen alleen boeken zonder thema; thema’s staan in een eigen groep", () => {
    expect(app).toMatch(/const BIJBELBOEKEN = BOEKEN\.filter\(\(b\) => !b\.thema\), THEMAS = BOEKEN\.filter\(\(b\) => b\.thema\);/);
    expect(app).toMatch(/\$\("boeken"\)\.innerHTML = BIJBELBOEKEN\.map\(/);
    expect(app).toMatch(/\$\("themas"\)\.innerHTML = THEMAS\.map\(/);
    expect(html).toMatch(/id="themaLabel">Thema’s<\/p><div class="themas" id="themas"/);
    expect(html.indexOf('id="boeken"')).toBeLessThan(html.indexOf('id="themas"'));
    const boekje = lees("boekje.js");
    expect(boekje).toContain('<optgroup label="Bijbelboeken">');
    expect(boekje).toContain('<optgroup label="Thema’s">');
  });
  it("geen Bijbelboek heeft een thema-id of loopt door in het thema: de volgorde blijft Genesis tot Openbaring", () => {
    expect(bijbelboeken[0].id).toBe("genesis");
    expect(bijbelboeken[bijbelboeken.length - 1].id).toBe("openbaring");
    expect(bijbelboeken.some((b) => b.id.startsWith("kerst") || b.delen.some((d) => d.id.startsWith("kerst-")))).toBe(false);
    // Vorige/Verder blijft binnen het thema (app.js: reeks).
    expect(app).toMatch(/const reeks = \(d\) => VOLG\.filter\(\(x\) => \(d\.boek\.thema \? x\.boek === d\.boek : !x\.boek\.thema\)\);/);
  });
  it("de stapsleutels van Kerst blijven kerst:<deel>:<index>", () => {
    const sleutels = themas[0].delen.flatMap((d) => d.steps.map((_, i) => `kerst:${d.id}:${i}`));
    expect(sleutels[0]).toBe("kerst:kerst-belofte:0");
    expect(sleutels).toHaveLength(59);
    expect(new Set(sleutels).size).toBe(59);
  });
});

describe("Kerst begint in het Oude Testament: reiziger en streeknamen per deel", () => {
  const kerst = BR.boeken.find((b) => b.id === "kerst")!;
  it("de eerste twee delen hebben geen veld nt, de vier latere wel", () => {
    expect(kerst.delen.map((d) => !!d.nt)).toEqual([false, false, true, true, true, true]);
    expect(lees("app.js")).toMatch(/const ntNu = \(\) => !!\(boek\.thema \? deel\.nt : boek\.nt\);/);
  });
  it("het boekje: #kerst-geboorte en #boek=kerst geven een pakket; de streeknamen volgen het deel", () => {
    const IN = BR.boekjeInhoud;
    expect(IN.lees("#kerst-geboorte")).toMatchObject({ soort: "deel", deel: "kerst-geboorte" });
    expect(IN.lees("#boek=kerst")).toMatchObject({ soort: "boek", boek: "kerst" });
    const geboorte = IN.maak(BR, { soort: "deel", deel: "kerst-geboorte", niveau: "b" })!;
    expect(geboorte.titel).toBe("De geboorte in Bethlehem");
    expect(geboorte.nt).toBe(true);
    expect(geboorte.dias.filter((d) => d.s === "stap")).toHaveLength(10);
    expect(IN.maak(BR, { soort: "deel", deel: "kerst-belofte", niveau: "b" })!.nt).toBe(false);
    const boek = IN.maak(BR, { soort: "boek", boek: "kerst", niveau: "b" })!;
    expect(boek.titel).toBe("Kerst: van Adam tot Bethlehem");
    expect(boek.dias.filter((d) => d.s === "stap")).toHaveLength(59);
    // De kaarten van de eerste twee delen (20 stappen) zijn als Oude Testament gemerkt, de andere niet.
    const stappen = boek.dias.filter((d) => d.s === "stap");
    expect(stappen.slice(0, 20).every((d) => !d.kaart || d.kaart.ot === 1)).toBe(true);
    expect(stappen.slice(20).some((d) => d.kaart && d.kaart.ot)).toBe(false);
    // Een Bijbelboek verandert niet: geen merk op de kaarten.
    expect(IN.maak(BR, { soort: "deel", deel: "abraham", niveau: "b" })!.dias.some((d) => d.kaart && d.kaart.ot)).toBe(false);
  });
});
