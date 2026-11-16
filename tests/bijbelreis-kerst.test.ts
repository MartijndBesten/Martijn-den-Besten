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
type Seizoen = { kerstTijd: (d?: Date | number | string) => boolean; eersteAdvent: (jaar: number) => Date; kerstBegindagen: (jaar: number) => Date[]; kerstWeek: (d?: Date | number | string) => number; kerstVolgende: (d?: Date | number | string) => Date | null };
type Dia = { s: string; kaart?: { ot?: number } };
type Pakket = { nt: boolean; titel: string; dias: Dia[] };
type BRt = { boeken: Boek[]; seizoen: Seizoen; boekjeInhoud: { maak: (br: BRt, keuze: Record<string, unknown>) => Pakket | null; lees: (hash: string) => Record<string, unknown> } };

// Dezelfde gegevens als de pagina laadt (zonder kaartmotor en app), plus de inhoud van het boekje.
const ctx: { window: { BR?: BRt } } = { window: {} };
for (const s of scripts.filter((s) => !/^(leaflet|app)\.js$/.test(s)).concat(["boekje-inhoud.js"])) runInNewContext(lees(s).replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BRt;
const { kerstTijd, eersteAdvent, kerstBegindagen, kerstWeek, kerstVolgende } = BR.seizoen;
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


// Het weekritme (16-11-2026): in het seizoen is elke week één van de zes delen van de kerstreis aan de beurt. Niets zit
// op slot; de week is alleen een aanwijzing op de seizoenskaart.
describe("seizoen: elke week één deel van de kerstreis", () => {
  const md = (d: Date) => [d.getMonth() + 1, d.getDate()];
  it("2026/27: de vier adventszondagen, de zondag na Kerst en 3 januari", () => {
    expect(kerstBegindagen(2026).map(md)).toEqual([[11, 29], [12, 6], [12, 13], [12, 20], [12, 27], [1, 3]]);
    expect(kerstWeek(dag(2026, 11, 28))).toBe(-1);
    expect(kerstWeek(dag(2026, 11, 29, 0, 0))).toBe(0);
    expect(kerstWeek(dag(2026, 11, 29))).toBe(0);
    expect(kerstWeek(dag(2026, 12, 5, 23, 59))).toBe(0);
    expect(kerstWeek(dag(2026, 12, 6, 0, 0))).toBe(1);
    expect(kerstWeek(dag(2026, 12, 13))).toBe(2);
    expect(kerstWeek(dag(2026, 12, 20))).toBe(3);
    expect(kerstWeek(dag(2026, 12, 25))).toBe(3); // Kerst valt in de week van de geboorte
    expect(kerstWeek(dag(2026, 12, 26))).toBe(3);
    expect(kerstWeek(dag(2026, 12, 27))).toBe(4);
    expect(kerstWeek(dag(2027, 1, 2))).toBe(4);
    expect(kerstWeek(dag(2027, 1, 3))).toBe(5);
    expect(kerstWeek(dag(2027, 1, 6, 23, 59))).toBe(5);
    expect(kerstWeek(dag(2027, 1, 7))).toBe(-1);
    expect(kerstWeek(dag(2026, 7, 15))).toBe(-1);
    expect(kerstWeek("geen datum")).toBe(-1);
    expect(kerstWeek("2026-12-10T10:00:00")).toBe(1);
  });
  it("het volgende deel begint op de volgende begindag; in de laatste week en buiten het seizoen is er geen", () => {
    expect(md(kerstVolgende(dag(2026, 11, 29))!)).toEqual([12, 6]);
    expect(md(kerstVolgende(dag(2026, 12, 5))!)).toEqual([12, 6]);
    expect(md(kerstVolgende(dag(2026, 12, 25))!)).toEqual([12, 27]);
    expect(md(kerstVolgende(dag(2026, 12, 28))!)).toEqual([1, 3]);
    expect(kerstVolgende(dag(2027, 1, 4))).toBeNull();
    expect(kerstVolgende(dag(2026, 7, 15))).toBeNull();
  });
  it("valt 25 december op zondag (2022), dan horen beide kerstdagen bij de geboorte", () => {
    expect(new Date(2022, 11, 25).getDay()).toBe(0);
    expect(kerstBegindagen(2022).map(md)).toEqual([[11, 27], [12, 4], [12, 11], [12, 18], [12, 27], [1, 1]]);
    expect(kerstWeek(dag(2022, 12, 24))).toBe(3);
    expect(kerstWeek(dag(2022, 12, 25))).toBe(3);
    expect(kerstWeek(dag(2022, 12, 26))).toBe(3);
    expect(kerstWeek(dag(2022, 12, 27))).toBe(4);
    expect(kerstWeek(dag(2023, 1, 1))).toBe(5);
    expect(kerstWeek(dag(2023, 1, 6))).toBe(5);
    // Het volgende deel begint dan niet op een zondag: de kaart zegt ‘Vanaf 27 december’.
    expect(kerstVolgende(dag(2022, 12, 25))!.getDay()).toBe(2);
  });
  it("in elk jaar komen alle zes de delen aan de beurt: op volgorde, deel 4 met beide kerstdagen, deel 6 minstens drie dagen", () => {
    for (let jaar = 2024; jaar <= 2052; jaar++) {
      const b = kerstBegindagen(jaar), t = b.map((d) => d.getTime());
      expect(b, String(jaar)).toHaveLength(6);
      for (let i = 1; i < 6; i++) expect(t[i], `${jaar}: deel ${i + 1}`).toBeGreaterThan(t[i - 1]);
      expect(t[0], String(jaar)).toBe(eersteAdvent(jaar).getTime());
      for (let i = 0; i < 4; i++) expect(b[i].getDay(), `${jaar}: advent ${i + 1}`).toBe(0);
      expect(b[5].getDay(), `${jaar}: deel 6`).toBe(0);
      expect(kerstWeek(new Date(jaar, 11, 25, 12)), `${jaar}: eerste kerstdag`).toBe(3);
      expect(kerstWeek(new Date(jaar, 11, 26, 12)), `${jaar}: tweede kerstdag`).toBe(3);
      expect(t[4], `${jaar}: deel 5`).toBeGreaterThanOrEqual(new Date(jaar, 11, 27).getTime());
      expect(t[5], `${jaar}: deel 6`).toBeLessThanOrEqual(new Date(jaar + 1, 0, 4).getTime());
      // Elke dag van het seizoen heeft precies één deel, en de delen lopen op.
      let vorige = 0;
      for (let d = new Date(b[0]); d.getTime() <= new Date(jaar + 1, 0, 6).getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
        const w = kerstWeek(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12));
        expect(w, `${jaar}: ${d.toDateString()}`).toBeGreaterThanOrEqual(vorige); expect(w).toBeLessThanOrEqual(5); vorige = w;
      }
      expect(vorige, `${jaar}: eindigt bij deel 6`).toBe(5);
    }
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
