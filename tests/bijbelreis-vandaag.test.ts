// Gegevenscontrole van de laag ‘Vandaag’ (public/bijbelreis/vandaag.js) en van de kaart van nu (grenzen.json).
// De regels staan in docs/bijbelreis-vandaag/README.md: geen partij kiezen, alleen wat blijft, sober, elke bewering met bron.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type Plek = { id: string; n: string; plaats?: string; ll?: [number, number]; land: string; streek?: string; soort: string; vandaag: string; bijbel: string; refs: string[]; bronnen: string[] };
type Range = { slug: string; c1: number; v1: number; c2: number; v2: number };
type BR = { plaatsen: Record<string, { n: string; ll: [number, number] }>; vandaag: { peil: string; toelichting: string; plekken: Plek[] }; parseRef: (r: string) => { ranges: Range[] } | null };

const PUB = join(__dirname, "..", "public");
const SVDIR = join(__dirname, "..", "data", "statenvertaling");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const ctx: { window: { BR?: BR } } = { window: {} };
for (const s of ["plaatsen.js", "verwijzing.js", "vandaag.js"]) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BR;
const V = BR.vandaag, P = BR.plaatsen;
const zinnen = (t: string) => t.split(/(?<=[.!?])\s+/).filter(Boolean);

// Bestaat de verwijzing in de Statenvertaling (data/statenvertaling, alleen voor controle)?
const bijbel: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function verzen(ref: string): string {
  const q = BR.parseRef(ref);
  if (!q || !q.ranges.length) return "onleesbaar";
  for (const rg of q.ranges) {
    const file = join(SVDIR, rg.slug + ".json");
    if (!existsSync(file)) return `boek ${rg.slug} ontbreekt in de controletekst`;
    bijbel[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bijbel[rg.slug].hoofdstukken, c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
    if (!H[rg.c1] || !H[c2]) return "hoofdstuk bestaat niet";
    if (rg.v1 > H[rg.c1].length) return `${rg.c1}:${rg.v1} bestaat niet`;
    if (rg.v2 !== 999 && rg.v2 > H[c2].length) return `${c2}:${rg.v2} bestaat niet`;
    if (c2 === rg.c1 && rg.v2 < rg.v1) return "omgekeerd bereik";
  }
  return "ok";
}

// Woorden die in de teksten niet mogen staan. Elk woord hoort bij een regel uit de README; het is een vangnet, geen vervanging
// van het nalezen ‘als iemand van elke partij’.
const VERBODEN: [string, RegExp][] = [
  // 1. Oordeel of schuldvraag: de atlas beschrijft, hij beoordeelt niet.
  ["oordeel", /terroris|terreur|moordenaar|moorddadig|misdadig|misdaad|wreed|barbaars|\blaf(fe)?\b|slachting|bloedbad|massamoord|genocide|volkerenmoord|etnische zuivering|apartheid|onschuldig|\bschuld|schandalig|schandelijk|helaas|gelukkig|\b(on)?terecht\b|heldhaftig|\bheld(en)?\b|martelaar|agressor|agressie|\bregime|dictator|extremis|fanatiek|\bradica/i],
  // 2. Woorden die één partij als de hare herkent (de ander gebruikt een ander woord voor hetzelfde).
  ["partijwoord", /\bbezet|bezetting|bezetter|kolonist|nederzetting|\bbevrijd|verzetsbeweging|verzetsstrijd|zionis|jihad|intifada|nakba|\bPalestina\b|Groot-Israël|apartheidsmuur|veiligheidshek|scheidingsmuur|betwiste gebieden|illega|onrechtmatig|annex|militant|vrijheidsstrijd/i],
  // 3. Gruwelijke details en bangmakerij: het is voor kinderen.
  ["gruwel", /gruwel|afgeslacht|onthoofd|verkracht|gemarteld|\blijken\b|\bbloed|verminkt|uitgehongerd|doodsbang|angstaanjagend|verschrikkelijk|vreselijk/i],
  // 4. Wat snel verandert: geen aantallen slachtoffers, geen frontlijnen, geen ‘op dit moment’.
  ["vluchtig", /\d[\d.]*\s*(doden|gewonden|slachtoffers|gijzelaars|vluchtelingen)|frontlijn|op dit moment|momenteel|deze week|deze maand|gisteren|sinds kort|onlangs/i],
];
// 5. Geen verband tussen Bijbelse beloften of profetie en de politiek van nu: zulke woorden horen niet onder ‘Vandaag’.
const BELOFTE = /beloofde land|belofte|beloofd|profetie|profeet|vervuld|vervulling|eindtijd|erfdeel|uitverkoren|heilsgeschiedenis|Gods plan|teken des tijds|tekenen van de tijd/i;

describe("vandaag: het gegevensbestand", () => {
  it("heeft een peildatum en één vaste zin dat de atlas geen partij kiest", () => {
    expect(V.peil).toMatch(/^\d{1,2} [a-z]+ 20\d\d$/);
    expect(zinnen(V.toelichting).length).toBe(1);
    expect(V.toelichting).toMatch(/geen partij/);
  });
  it("heeft 25 tot 40 plekken met unieke ids, verspreid over het hele gebied", () => {
    expect(V.plekken.length).toBeGreaterThanOrEqual(25);
    expect(V.plekken.length).toBeLessThanOrEqual(40);
    expect(new Set(V.plekken.map((x) => x.id)).size).toBe(V.plekken.length);
    expect(new Set(V.plekken.map((x) => x.streek)).size).toBeGreaterThanOrEqual(6);
    for (const land of ["Israël", "Westelijke Jordaanoever", "Gazastrook", "Libanon", "Syrië", "Jordanië", "Egypte", "Irak", "Iran", "Turkije", "Griekenland", "Cyprus", "Italië"]) expect(V.plekken.some((x) => x.land === land), land).toBe(true);
  });
  it("elke plek heeft naam, land, soort, bronnen en een plek op de kaart", () => {
    for (const x of V.plekken) {
      expect(x.id, "id").toMatch(/^[a-z]+$/);
      expect(x.n && x.land && x.streek, x.id).toBeTruthy();
      expect(["stad", "opgraving", "gebied", "water", "berg", "eiland"], x.id).toContain(x.soort);
      expect(Array.isArray(x.bronnen) && x.bronnen.length >= 1, `${x.id}: geen bron`).toBe(true);
      for (const u of x.bronnen) expect(u, x.id).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/\S*$/);
      // Coördinaten binnen het kaartgebied, of een bestaande plaats uit plaatsen.js (liefst die: dan staat de ligging maar één keer).
      if (x.plaats !== undefined) expect(P[x.plaats], `${x.id}: plaats ${x.plaats} bestaat niet`).toBeTruthy();
      const ll = x.ll ?? (x.plaats ? P[x.plaats].ll : undefined);
      expect(ll, `${x.id}: geen coördinaten en geen plaats`).toBeTruthy();
      expect(ll![0] >= 10 && ll![0] <= 47 && ll![1] >= 4 && ll![1] <= 60, `${x.id}: buiten het kaartgebied`).toBe(true);
    }
  });
  it("bronnen komen van de afgesproken soorten bronnen", () => {
    // Rijksoverheid, VN-organisaties, EU, NOS, naslagwerken en (voor één kerkelijk gegeven) Vatican News.
    const TOEGESTAAN = /(^|\.)(rijksoverheid\.nl|nederlandwereldwijd\.nl|unesco\.org|un\.org|unmissions\.org|unrwa\.org|ochaopt\.org|europa\.eu|nos\.nl|livius\.org|nasa\.gov|vaticannews\.va)$/;
    for (const x of V.plekken) for (const u of x.bronnen) expect(new URL(u).hostname, `${x.id}: ${u}`).toMatch(TOEGESTAAN);
  });
  it("teksten zijn kort: twee tot vier zinnen ‘Vandaag’, een of twee zinnen ‘In de Bijbel’", () => {
    for (const x of V.plekken) {
      const v = zinnen(x.vandaag).length, b = zinnen(x.bijbel).length;
      expect(v >= 2 && v <= 4, `${x.id}: ${v} zinnen ‘Vandaag’`).toBe(true);
      expect(b >= 1 && b <= 2, `${x.id}: ${b} zinnen ‘In de Bijbel’`).toBe(true);
      expect(x.vandaag.length, `${x.id}: te lang`).toBeLessThanOrEqual(520);
      expect(x.bijbel.length, `${x.id}: te lang`).toBeLessThanOrEqual(240);
    }
  });
  it("Bijbelverwijzingen bestaan in de Statenvertaling", () => {
    const fout: string[] = [];
    for (const x of V.plekken) {
      expect(x.refs.length, x.id).toBeGreaterThanOrEqual(1);
      for (const r of x.refs) { const u = verzen(r); if (u !== "ok") fout.push(`${x.id}: ${r} (${u})`); }
    }
    expect(fout).toEqual([]);
  });
});

describe("vandaag: neutraal, sober en duurzaam", () => {
  const teksten = V.plekken.flatMap((x) => [[x.id + " vandaag", x.vandaag], [x.id + " bijbel", x.bijbel], [x.id + " naam", `${x.n} ${x.land} ${x.streek}`]] as [string, string][]).concat([["toelichting", V.toelichting]]);
  it("geen partijdige of oordelende woorden, geen gruwelijke details, niets wat morgen anders is", () => {
    const fout: string[] = [];
    for (const [waar, t] of teksten) for (const [soort, rx] of VERBODEN) { const m = t.match(rx); if (m) fout.push(`${waar}: ‘${m[0]}’ (${soort})`); }
    expect(fout).toEqual([]);
  });
  it("legt onder ‘Vandaag’ geen verband met beloften of profetie", () => {
    for (const x of V.plekken) expect(x.vandaag.match(BELOFTE)?.[0] ?? null, x.id).toBeNull();
  });
  it("noemt een naam van één partij alleen samen met die van de ander, en zegt erbij wie hem gebruikt", () => {
    for (const x of V.plekken) {
      const t = x.vandaag;
      if (/Judea en Samaria/.test(t)) expect(/Israëlische regering noemt de Westelijke Jordaanoever Judea en Samaria/.test(t), x.id).toBe(true);
      if (/Tempelberg|Haram/.test(t)) expect(/Tempelberg/.test(t) && /Haram/.test(t), x.id).toBe(true);
      if (/Ibrahimi|Aartsvaders/.test(t)) expect(/Ibrahimi/.test(t) && /Aartsvaders/.test(t), x.id).toBe(true);
      if (/Al-Quds|Jeroesjalajim/.test(t)) expect(/Al-Quds/.test(t) && /Jeroesjalajim/.test(t), x.id).toBe(true);
      if (/Al-Khalil|Chevron/.test(t)) expect(/Al-Khalil/.test(t) && /Chevron/.test(t), x.id).toBe(true);
    }
  });
  it("beschrijft Jeruzalem met evenveel woorden voor beide partijen", () => {
    const j = V.plekken.find((x) => x.id === "jeruzalem")!.vandaag;
    const m = j.match(/(Israël [^;.]+); (de Palestijnen [^;.]+)\./)!;
    expect(m, "zin met beide standpunten").toBeTruthy();
    const a = m[1].split(/\s+/).length, b = m[2].split(/\s+/).length;
    expect(Math.abs(a - b), `${a} tegen ${b} woorden`).toBeLessThanOrEqual(4);
  });
  it("gebruikt geen enkele aanhalingstekens (die betekenen in de Bijbelreis letterlijk Statenvertaling)", () => {
    for (const [waar, t] of teksten) expect(/[‘’']/.test(t), waar).toBe(false);
  });
  it("noemt de landen en gebieden zoals de kaart ze noemt", () => {
    const TOEGESTAAN = new Set(["Israël", "Israël en de Palestijnse gebieden", "Westelijke Jordaanoever", "Gazastrook", "Golanhoogten", "Libanon", "Syrië", "Jordanië", "Egypte", "Irak", "Iran", "Turkije", "Griekenland", "Cyprus", "Malta", "Italië"]);
    for (const x of V.plekken) expect(TOEGESTAAN.has(x.land), `${x.id}: ${x.land}`).toBe(true);
  });
});

describe("kaart van nu: grenzen.json volgt de maatstaf", () => {
  type F = { geometry: { type: string }; properties: { soort?: string; naam?: string; ankers?: number[][] } };
  const g = JSON.parse(readFileSync(join(PUB, "bijbelreis", "grenzen.json"), "utf8")) as { maatstaf: string; features: F[] };
  const punten = g.features.filter((f) => f.geometry.type === "Point"), lijnen = g.features.filter((f) => f.geometry.type === "LineString");
  const landen = punten.filter((f) => f.properties.soort === "land").map((f) => f.properties.naam);
  const gebieden = punten.filter((f) => f.properties.soort === "gebied").map((f) => f.properties.naam).sort();
  it("geeft alleen een landnaam aan staten die Nederland erkent", () => {
    expect(g.maatstaf).toMatch(/Nederland erkent/);
    for (const n of ["Israël", "Egypte", "Jordanië", "Libanon", "Syrië", "Irak", "Iran", "Turkije", "Griekenland", "Italië", "Cyprus", "Malta", "Kosovo"]) expect(landen, n).toContain(n);
    for (const n of ["Noord-Cyprus", "Palestina", "Palestijnse gebieden", "VN-Bufferzone", "Krim"]) expect(landen, n).not.toContain(n);
  });
  it("noemt omstreden gebieden bij hun gangbare Nederlandse naam, als gebied", () => {
    expect(gebieden).toEqual(["Gazastrook", "Golanhoogten", "Westelijke Jordaanoever"]);
  });
  it("kent erkende landsgrenzen en, als eigen soort, bestandslijnen en omstreden grenzen", () => {
    const soorten = new Set(lijnen.map((f) => f.properties.soort));
    expect([...soorten].sort()).toEqual(["bestandslijn", "betwist", "grens", "onbepaald"]);
    expect(lijnen.filter((f) => f.properties.soort === "grens").length).toBeGreaterThan(50);
  });
  it("elke naam heeft ankers binnen het kaartgebied", () => {
    for (const f of punten) {
      expect(Array.isArray(f.properties.ankers) && f.properties.ankers!.length >= 1, f.properties.naam).toBe(true);
      for (const [la, lo] of f.properties.ankers!) expect(la >= 22 && la <= 47 && lo >= 4 && lo <= 57, `${f.properties.naam}: ${la}, ${lo}`).toBe(true);
    }
  });
});

describe("vandaag: de pagina", () => {
  it("laadt vandaag.js vóór app.js en heeft de knop, de lade en de legendaregels", () => {
    expect(html.indexOf("/bijbelreis/vandaag.js")).toBeGreaterThan(0);
    expect(html.indexOf("/bijbelreis/vandaag.js")).toBeLessThan(html.indexOf("/bijbelreis/app.js"));
    for (const id of ["vandaagBtn", "vandaagLijstBtn", "vandaagLade", "vandaagVenster", "vdPeil", "vdToelichting", "vdZoek"]) expect(html, id).toContain(`id="${id}"`);
    expect(html).toContain("bestandslijn of omstreden grens");
  });
});
