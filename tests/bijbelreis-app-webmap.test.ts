// De iOS-app (apps/ios) gebruikt de atlas uit public/ als webmap. Deze test draait apps/ios/scripts/maak-webmap.mjs op de
// huidige public/, zonder Capacitor of netwerk: breekt een wijziging aan de website de app (nieuwe /api-aanroep, bron van
// buiten, adres zonder bestemming, nieuwe pagina), dan wordt CI rood. Uitleg: apps/ios/README.md.
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
// @ts-expect-error: een gewone .mjs zonder typen
import { maakWebmap } from "../apps/ios/scripts/maak-webmap.mjs";

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
type Adres = { soort: "app" | "site" | "bestand"; url: string };
const ctx: { window: { bijbelreisAdres?: (pad: string, hash?: string) => Adres } } = { window: {} };
runInNewContext(readFileSync(join(ROOT, "apps/ios/app-laag/adressen.js"), "utf8"), ctx);
const adres = ctx.window.bijbelreisAdres!;

let tmp = "";
beforeAll(() => { tmp = mkdtempSync(join(tmpdir(), "bijbelreis-webmap-")); });
afterAll(() => { if (tmp) rmSync(tmp, { recursive: true, force: true }); });

describe("maak-webmap op de huidige website", () => {
  it("slaagt, en de webmap is wat de app verwacht", () => {
    const uit = join(tmp, "www");
    const r = maakWebmap({ uit, stil: true });
    expect(r.bestanden).toBeGreaterThan(100);
    const index = readFileSync(join(uit, "index.html"), "utf8");
    expect(index).toContain('data-app="ios"');
    expect(index).toContain("default-src 'self'");
    expect(index).not.toMatch(/bezoek\.js|pwa\.js|rel="manifest"|apple-mobile-web-app/);
    expect(index).toContain("de app verstuurt niets");
    for (const p of ["bijbelreis/lessen.html", "bijbelreis/privacy.html", "bijbelreis/hulp.html", "app/app-laag.js", "app/adressen.js"]) expect(existsSync(join(uit, p)), p).toBe(true);
    for (const p of ["bijbelreis/bezoek.js", "bijbelreis/pwa.js", "bijbelreis/manifest.webmanifest", "bijbelreis/boekje.html", "bijbelreis.html"]) expect(existsSync(join(uit, p)), p).toBe(false);
    expect(readFileSync(join(uit, "bijbelreis/lessen.html"), "utf8")).toMatch(/<script src="\/app\/adressen\.js"><\/script>\s*<script src="\/app\/app-laag\.js">/);
  });
});

describe("maak-webmap faalt als de website iets nieuws doet dat niet in de app past", () => {
  // Een kopie van de bestanden die de app gebruikt, met één wijziging.
  function met(wijzig: (pub: string) => void): () => unknown {
    const pub = join(tmp, "pub-" + Math.random().toString(36).slice(2));
    for (const p of ["bijbelreis.html", "bijbelreis", "fonts"]) cpSync(join(PUB, p), join(pub, p), { recursive: true });
    wijzig(pub);
    return () => maakWebmap({ uit: join(pub, "..", "www-" + Math.random().toString(36).slice(2)), pub, stil: true });
  }
  const voegToe = (pub: string, bestand: string, tekst: string) => writeFileSync(join(pub, bestand), readFileSync(join(pub, bestand), "utf8") + tekst);

  it("een nieuwe /api-aanroep", () => {
    expect(met((p) => voegToe(p, "bijbelreis/indeling.js", '\nfetch("/api/nieuw");'))).toThrow(/\/api\/nieuw/);
  });
  it("een nieuwe netwerkaanroep", () => {
    expect(met((p) => voegToe(p, "bijbelreis/indeling.js", '\nfetch("/bijbelreis/geo.json");'))).toThrow(/netwerkaanroep/);
  });
  it("een script van buiten", () => {
    expect(met((p) => writeFileSync(join(p, "bijbelreis.html"), readFileSync(join(p, "bijbelreis.html"), "utf8").replace("</body>", '<script src="https://voorbeeld.nl/x.js"></script></body>')))).toThrow(/van buiten/);
  });
  it("een eigen adres zonder bestemming in de app", () => {
    expect(met((p) => writeFileSync(join(p, "bijbelreis.html"), readFileSync(join(p, "bijbelreis.html"), "utf8").replace("</main>", '<a href="/bijbelreis/nieuw">x</a></main>')))).toThrow(/geen bestemming/);
  });
  it("een nieuwe pagina", () => {
    expect(met((p) => writeFileSync(join(p, "bijbelreis/nieuw.html"), "<!doctype html><title>x</title>"))).toThrow(/nieuwe pagina/);
  });
  it("navigeren per script", () => {
    expect(met((p) => voegToe(p, "bijbelreis/indeling.js", '\nif (0) window.open("https://voorbeeld.nl");'))).toThrow(/navigeert per script/);
  });
  it("een service worker", () => {
    expect(met((p) => voegToe(p, "bijbelreis/indeling.js", "\nif (0) navigator.serviceWorker.register('/sw.js');"))).toThrow(/serviceWorker/);
  });
  it("een privacytekst die niet meer te vervangen is", () => {
    expect(met((p) => writeFileSync(join(p, "bijbelreis.html"), readFileSync(join(p, "bijbelreis.html"), "utf8").replace("<dt>Privacy</dt>", "<dt>Gegevens</dt>")))).toThrow(/privacy/);
  });
});

describe("adressen in de app (apps/ios/app-laag/adressen.js)", () => {
  it("atlas, lesroutes, privacy en hulp zijn pagina's in de app", () => {
    expect(adres("/bijbelreis", "#v12")).toEqual({ soort: "app", url: "/#v12" });
    expect(adres("/", "")).toEqual({ soort: "app", url: "/" });
    expect(adres("/index.html", "#jakob/3")).toEqual({ soort: "app", url: "/#jakob/3" });
    expect(adres("/bijbelreis/lessen", "#jozef/2")).toEqual({ soort: "app", url: "/bijbelreis/lessen.html#jozef/2" });
    expect(adres("/privacy")).toEqual({ soort: "app", url: "/bijbelreis/privacy.html" });
    expect(adres("/bijbelreis/hulp/")).toEqual({ soort: "app", url: "/bijbelreis/hulp.html" });
  });
  it("verhaalpagina's van de website gaan naar dezelfde geschiedenis in de atlas", () => {
    expect(adres("/verhaal/26-jakob-en-ezau")).toEqual({ soort: "app", url: "/#v26" });
    expect(adres("/bijbelreis/verhaal/7-x.html")).toEqual({ soort: "app", url: "/#v7" });
    expect(adres("/verhalen")).toEqual({ soort: "app", url: "/#verhalen" });
  });
  it("presentatie en boekje, en onbekende adressen, gaan (via de ouderpoort) naar bijbelreis.nl", () => {
    expect(adres("/bijbelreis/boekje", "#v12&niveau=b")).toEqual({ soort: "site", url: "https://bijbelreis.nl/bijbelreis/boekje#v12&niveau=b" });
    expect(adres("/iets-nieuws")).toEqual({ soort: "site", url: "https://bijbelreis.nl/iets-nieuws" });
    expect(adres("/bijbelreis/LICENSE-leaflet.txt")).toEqual({ soort: "bestand", url: "/bijbelreis/LICENSE-leaflet.txt" });
  });
});
