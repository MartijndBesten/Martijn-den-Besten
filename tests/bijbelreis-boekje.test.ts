// Presentatie en boekje (/bijbelreis/boekje): de kaarttekenaar (boekje-kaart.js), de inhoud (boekje-inhoud.js) en het
// adres op beide workers. Uitleg: docs/bijbelreis-boekje/README.md.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { bijbelreisPagina } from "../shared/bijbelreis";
import { maakBijbelreisWorker, type Bestanden } from "../worker/bijbelreis-app";

// Een klein nepstel bestanden voor de Bijbelreis-worker (het echte stel maakt scripts/embed-assets.mjs na de build).
const FILES: Bestanden = {
  "/bijbelreis.html": ["text/html; charset=utf-8", "a1", btoa("<!doctype html><title>atlas</title>")],
  "/bijbelreis/boekje.html": ["text/html; charset=utf-8", "b2", btoa("<!doctype html><title>boekje</title>")],
  "/bijbelreis/boekje.js": ["text/javascript; charset=utf-8", "c3", btoa("// boekje")],
};
const REGELS = [{ pattern: "/*", headers: { "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'" } }, { pattern: "/bijbelreis/*", headers: { "Cache-Control": "public, max-age=3600" } }];

describe("adres van de pagina", () => {
  const bestaat = (p: string) => p === "/bijbelreis/boekje.html";
  it("serveert /bijbelreis/boekje en verwijst .html en een slash erachter door", () => {
    expect(bijbelreisPagina("/bijbelreis/boekje", bestaat)).toEqual({ bestand: "/bijbelreis/boekje.html" });
    expect(bijbelreisPagina("/bijbelreis/boekje.html", bestaat)).toEqual({ naar: "/bijbelreis/boekje" });
    expect(bijbelreisPagina("/bijbelreis/boekje/", bestaat)).toEqual({ naar: "/bijbelreis/boekje" });
    expect(bijbelreisPagina("/bijbelreis/app.js", bestaat)).toBeNull();
    expect(bijbelreisPagina("/bijbelreis/bestaat-niet", bestaat)).toBeNull();
    expect(bijbelreisPagina("/bijbelreis", bestaat)).toBeNull();
    expect(bijbelreisPagina("/boekje", bestaat)).toBeNull();
  });
  it("werkt op de worker van bijbelreis.nl, met de beveiligingskoppen (niet in een kader)", async () => {
    const w = maakBijbelreisWorker(FILES, REGELS) as unknown as { fetch: (r: Request) => Promise<Response> };
    const worker = { fetch: (r: Request) => w.fetch(r) };
    const r = await worker.fetch(new Request("https://bijbelreis.nl/bijbelreis/boekje"));
    expect(r.status).toBe(200);
    expect(await r.text()).toContain("boekje");
    expect(r.headers.get("X-Frame-Options")).toBe("DENY");
    expect(r.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    const door = await worker.fetch(new Request("https://bijbelreis.nl/bijbelreis/boekje.html?x=1"));
    expect(door.status).toBe(301);
    expect(door.headers.get("Location")).toBe("https://bijbelreis.nl/bijbelreis/boekje?x=1");
    expect((await worker.fetch(new Request("https://bijbelreis.nl/bijbelreis/boekje.js"))).status).toBe(200);
    expect((await worker.fetch(new Request("https://bijbelreis.nl/bijbelreis/niets"))).status).toBe(404);
    // De atlas zelf blijft op /.
    expect((await worker.fetch(new Request("https://bijbelreis.nl/"))).status).toBe(200);
  });
  it("staat in de configuratie van de hoofdsite: Static Assets maakt van boekje.html het adres /bijbelreis/boekje", () => {
    const cfg = readFileSync(join(__dirname, "..", "wrangler.jsonc"), "utf8");
    expect(cfg).toMatch(/"html_handling":\s*"auto-trailing-slash"/);
  });
});

// ---------- de inhoud van de atlas en de twee bestanden van het boekje, zoals de pagina ze laadt ----------
type Pakket = { soort: string; niveau: string; titel: string; hash: string; keuze: Record<string, unknown>; dias: Record<string, any>[]; routes: { pts: number[][]; ids: (string | null)[]; w: string; recon?: number }[]; plaatsen: Record<string, { n: string; ll: number[]; c?: string }>; taferelen: Record<string, { svg: string }> }; // eslint-disable-line @typescript-eslint/no-explicit-any
const PUB = join(__dirname, "..", "public");
const pagina = readFileSync(join(PUB, "bijbelreis", "boekje.html"), "utf8");
const ctx: { window: Record<string, any> } = { window: {} }; // eslint-disable-line @typescript-eslint/no-explicit-any
for (const s of [...pagina.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/boekje-speler|boekje\.js$/.test(s)))
  runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
for (const n of ["a", "b", "c"]) runInNewContext(readFileSync(join(PUB, "bijbelreis", "niveaus", n + ".js"), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR, KA = BR.boekjeKaart, IN = BR.boekjeInhoud;
const geo = JSON.parse(readFileSync(join(PUB, "bijbelreis", "geo.json"), "utf8")), toen = JSON.parse(readFileSync(join(PUB, "bijbelreis", "toen.json"), "utf8"));
const basis = KA.basisVan(geo, toen);
const maak = (hash: string): Pakket => IN.maak(BR, IN.lees(hash));
const stap = (boek: string, deel: string, i: number) => BR.boeken.find((b: { id: string }) => b.id === boek).delen.find((d: { id: string }) => d.id === deel).steps[i];

describe("kaarttekenaar", () => {
  it("snijdt een gebied uit met marge, in de gevraagde verhouding en binnen de ondergrond", () => {
    const pts = [[30.96, 46.1], [36.86, 39.03]]; // Ur en Haran
    const b = KA.uitsnede(pts, { aspect: 1.6, marge: 0.2 });
    expect(b.w).toBeLessThan(39.03); expect(b.e).toBeGreaterThan(46.1); expect(b.s).toBeLessThan(30.96); expect(b.n).toBeGreaterThan(36.86);
    expect((b.e - b.w) / (KA.mercY(b.n) - KA.mercY(b.s))).toBeCloseTo(1.6, 5);
    // Eén plaats krijgt een streek om zich heen, geen punt.
    const een = KA.uitsnede([[31.85, 35.45]], { aspect: 1.5, minLon: 1.4 });
    expect(een.e - een.w).toBeCloseTo(1.4, 5);
    // Verder dan de ondergrond gaat de uitsnede niet.
    const ver = KA.uitsnede([[30, 9], [41.9, 52]], { aspect: 1, marge: 0.4 });
    expect(ver.w).toBeGreaterThanOrEqual(KA.BEREIK.w - 1e-9); expect(ver.e).toBeLessThanOrEqual(KA.BEREIK.e + 1e-9);
  });
  it("projecteert zoals de atlas (Mercator): west links, noord boven, alles binnen het beeld", () => {
    const b = KA.uitsnede([[29, 32], [33, 36]], { aspect: 1.5 }), pr = KA.projectie(b, 900, 600);
    expect(pr.x(b.w)).toBeCloseTo(0, 6); expect(pr.x(b.e)).toBeCloseTo(900, 6);
    expect(pr.y(b.n)).toBeCloseTo(0, 6); expect(pr.y(b.s)).toBeCloseTo(600, 6);
    const [x, y] = pr.pt([31, 34]); expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(900); expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(600);
    expect(pr.kmPerPx).toBeGreaterThan(0);
  });
  it("knipt vlakken en lijnen af op de rand", () => {
    const ring = KA.knipRing([[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], { w: 5, e: 20, s: 5, n: 20 });
    ring.forEach((p: number[]) => { expect(p[0]).toBeGreaterThanOrEqual(5); expect(p[1]).toBeGreaterThanOrEqual(5); });
    expect(KA.knipLijn([[0, 0], [10, 10]], { w: 2, e: 8, s: 2, n: 8 })).toEqual([[[2, 2], [8, 8]]]);
    expect(KA.vereenvoudig([[0, 0], [1, 0.001], [2, 0]], 0.01)).toEqual([[0, 0], [2, 0]]);
  });
  it("tekent een route die binnen het beeld blijft, met begin, pijlpunt, plaatsen, zekerheid en schaalstok", () => {
    const pk = maak("#ur-kanaan/3&niveau=b"), d = pk.dias.find((x) => x.s === "stap")!;
    const r = KA.teken(d.kaart, { basis, plaatsen: pk.plaatsen, routes: pk.routes }, { W: 960, H: 600, fs: 18, id: "t" });
    expect(r.routes).toHaveLength(1);
    r.routes[0].pts.forEach(([x, y]: number[]) => { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(960); expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(600); });
    expect(r.svg).toContain('data-plaats="ur"'); expect(r.svg).toContain('data-plaats="haran"');
    expect(r.svg).toContain('data-zeker="w"'); // Ur is ‘waarschijnlijk’ en blijft zo te zien
    expect(r.svg).toMatch(/class="bk-route recon/); expect(r.svg).toContain(">reconstructie<");
    expect(r.svg).toContain('data-begin="0"'); expect(r.svg).toContain('data-kop="0"');
    expect(r.svg).toMatch(/class="bk-schaal"[\s\S]*km</);
    expect(r.label).toMatch(/Route van Ur naar Haran \(reconstructie\)/);
    // Begin en eind hebben een naam, en geen twee namen liggen over elkaar.
    expect(r.svg).toContain('data-naam="ur"'); expect(r.svg).toContain('data-naam="haran"');
  });
  it("houdt een onbekende plek vaag en een betwiste plek met haar andere mogelijke plekken", () => {
    const pk = maak("#uittocht/6&niveau=c"), d = pk.dias.find((x) => x.s === "stap")!;
    const r = KA.teken(d.kaart, { basis, plaatsen: pk.plaatsen, routes: pk.routes }, { W: 900, H: 600, fs: 16, id: "u" });
    expect(r.svg).toContain('class="bk-vaag" data-plaats="pihachiroth"');
    expect(r.svg).toContain('data-plaats="schelfzee" data-zeker="b"');
    expect(r.svg).toContain('class="bk-alt"');
  });
  it("gebruikt dezelfde streeknamen en beken als de atlas", () => {
    const app = readFileSync(join(PUB, "bijbelreis", "app.js"), "utf8");
    const lijst = (naam: string) => runInNewContext("(" + app.match(new RegExp(`const ${naam} = (\\[[\\s\\S]*?\\n  \\]);`))![1] + ")");
    expect(JSON.stringify(KA.REGIONS)).toBe(JSON.stringify(lijst("REGIONS")));
    expect(JSON.stringify(KA.KLEINE_RIVIEREN)).toBe(JSON.stringify(lijst("KLEINE_RIVIEREN")));
  });
});

describe("inhoud van de presentatie", () => {
  it("leest de adressen", () => {
    expect(IN.lees("#jakob")).toMatchObject({ soort: "deel", deel: "jakob", van: null });
    expect(IN.lees("#abraham/3-8&niveau=a")).toMatchObject({ soort: "deel", deel: "abraham", van: 3, tot: 8, niveau: "a" });
    expect(IN.lees("#jozua/intocht")).toMatchObject({ soort: "deel", boek: "jozua", deel: "intocht" });
    expect(IN.lees("#boek=exodus&toon=boekje")).toMatchObject({ soort: "boek", boek: "exodus", toon: "boekje" });
    expect(IN.lees("#v26&niveau=c")).toMatchObject({ soort: "verhaal", nr: 26, niveau: "c" });
    expect(IN.lees("")).toMatchObject({ soort: null });
    expect(IN.maakHash({ soort: "deel", deel: "abraham", van: 3, tot: 8, niveau: "b" })).toBe("#abraham/3-8&niveau=b");
  });
  it("volgt de stappen van een deel in de goede volgorde, met de eigen tekst en verwijzing", () => {
    const pk = maak("#ur-kanaan&niveau=c"), stappen = pk.dias.filter((d) => d.s === "stap");
    expect(pk.dias[0].s).toBe("titel"); expect(pk.dias[pk.dias.length - 1].s).toBe("slot");
    expect(stappen).toHaveLength(8);
    stappen.forEach((d, i) => { const s = stap("genesis", "ur-kanaan", i); expect(d.t).toBe(s.t); expect(d.ref).toBe(s.ref); expect(d.txt).toBe(s.txt); expect(d.nr).toBe(i + 1); });
    expect(pk.dias.filter((d) => d.s === "vraag").length).toBeGreaterThan(0);
  });
  it("neemt alleen de gekozen stappen van een bereik, met de eerdere stappen dun op de kaart", () => {
    const pk = maak("#abraham/3-5&niveau=b"), stappen = pk.dias.filter((d) => d.s === "stap");
    expect(stappen.map((d) => d.nr)).toEqual([3, 4, 5]);
    expect(pk.dias[0].bereik).toBe("stap 3–5 van 25");
    expect(stappen[0].kaart.eerder.length).toBeGreaterThan(0);
  });
  it("maakt van een heel boek alle delen achter elkaar", () => {
    const pk = maak("#boek=jona"), boek = BR.boeken.find((b: { id: string }) => b.id === "jona");
    expect(pk.dias.filter((d) => d.s === "stap")).toHaveLength(boek.delen.reduce((n: number, d: { steps: unknown[] }) => n + d.steps.length, 0));
  });
  it("niveau a toont de eerste zin, zonder rode zijroutes; niveau c alles met de verdieping", () => {
    const a = maak("#uittocht&niveau=a"), c = maak("#uittocht&niveau=c");
    const s4a = a.dias.find((d) => d.sleutel === "exodus:uittocht:4")!, s4c = c.dias.find((d) => d.sleutel === "exodus:uittocht:4")!;
    expect(s4c.txt).toBe(stap("exodus", "uittocht", 4).txt);
    expect(s4a.txt).toBe(IN.eersteZin(stap("exodus", "uittocht", 4).txt));
    expect(s4a.fact).toBeUndefined(); expect(s4c.fact).toBeTruthy();
    const v = maak("#v26&niveau=c");
    expect(v.dias.some((d) => d.s === "tekst" && d.kop === "Verdieping")).toBe(true);
    const va = maak("#v26&niveau=a");
    expect(va.dias.filter((d) => d.s === "vraag").every((d) => d.a.length === 2)).toBe(true);
    expect(va.dias.filter((d) => d.s === "stap").map((d) => d.txt)).toEqual(BR.niveaus.verhalen[26].a.delen.map((x: { t: string }) => x.t));
  });
  it("neemt het tafereel van een stap onveranderd over", () => {
    const pk = maak("#intocht&niveau=b"), d = pk.dias.find((x) => x.sleutel === "jozua:intocht:4")!;
    expect(d.tf.id).toBe("jericho");
    expect(pk.taferelen.jericho.svg).toBe(BR.taferelen.jericho.svg);
  });
  it("geeft niets bij een onbekend deel of een geschiedenis die niet bestaat", () => {
    expect(IN.maak(BR, IN.lees("#bestaat-niet"))).toBeNull();
    expect(IN.maak(BR, IN.lees("#v151"))).toBeNull();
  });
});

describe("los bestand", () => {
  it("vindt de kleuren en de taferelen in bijbelreis.css", () => {
    const css = readFileSync(join(PUB, "bijbelreis", "bijbelreis.css"), "utf8");
    expect(css).toMatch(/:root\s*\{[\s\S]*?--zee:[\s\S]*?\n\}/);
    expect(css).toContain("/* ===== Taferelen");
    expect(css.slice(css.indexOf("/* ===== Taferelen"))).toContain(".tf-svg .k-land");
  });
});

describe("boekje.html laadt dezelfde inhoud als de atlas", () => {
  // Het boekje heeft een eigen lijst met scripts. Komt er in bijbelreis.html een inhouds- of tafereelbestand bij (een nieuw
  // boek, een thema, een reeks taferelen), dan moet het ook hier staan, anders mist het boekje die delen of beelden.
  const lijst = (f: string) => [...readFileSync(join(PUB, f), "utf8").matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]);
  // personen: het boekje toont geen personenkaarten; seizoen: het boekje heeft geen seizoeningang (Thema’s staan er vast onder de Bijbelboeken)
  const alleenAtlas = /^(leaflet|app|vandaag|verhuis|personen|seizoen)\.js$/;
  it("elk script van de atlas (behalve kaartmotor, app, personen, het seizoen en de laag Vandaag) staat ook in het boekje, in dezelfde volgorde", () => {
    const atlas = lijst("bijbelreis.html").filter((s) => !alleenAtlas.test(s));
    const boekje = lijst(join("bijbelreis", "boekje.html")).filter((s) => !/^boekje/.test(s));
    expect(boekje).toEqual(atlas);
  });
});
