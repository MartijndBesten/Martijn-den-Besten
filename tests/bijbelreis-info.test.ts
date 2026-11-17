// Privacy (/privacy) en Hulp (/hulp) op bijbelreis.nl: de pagina's die App Store Connect vraagt (privacybeleid en
// support-URL). Ze staan in public/bijbelreis/ en gaan ook mee in de iOS-app. Uitleg: docs/bijbelreis-ios/APPSTORE.md.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { maakBijbelreisWorker, type Bestanden } from "../worker/bijbelreis-app";

const PUB = join(__dirname, "..", "public");
const lees = (p: string) => readFileSync(join(PUB, p), "utf8");
const PAGINAS = { privacy: lees("bijbelreis/privacy.html"), hulp: lees("bijbelreis/hulp.html") };

describe("de pagina's zelf", () => {
  it("geen script, geen inline handlers, niets van buiten (CSP default-src 'self')", () => {
    for (const [n, html] of Object.entries(PAGINAS)) {
      expect(html, n).not.toMatch(/<script|\son[a-z]+=|<iframe|<form/i);
      for (const [, u] of html.matchAll(/\ssrc="([^"]+)"/g)) expect(u.startsWith("/"), `${n}: ${u}`).toBe(true);
      for (const m of html.matchAll(/<link\b[^>]*href="([^"]+)"[^>]*>/g)) expect(m[1].startsWith("/") || /rel="canonical"/.test(m[0]), `${n}: ${m[1]}`).toBe(true);
      expect(html).toContain('lang="nl"');
      expect(html).toContain("mailto:info@denckh.nl");
      expect(html).toContain(`<link rel="canonical" href="https://bijbelreis.nl/${n}" />`);
    }
  });
  it("de privacyverklaring zegt wat er echt gebeurt (website én app)", () => {
    const t = PAGINAS.privacy;
    for (const zin of ["De app verzamelt niets en verstuurt niets", "Geen account, geen cookies en geen advertenties", "400 dagen", "Do Not Track", "na twee dagen gewist", "ouderpoort", "Cloudflare"]) expect(t, zin).toContain(zin);
    expect(t).not.toMatch(/KvK|geen trackers/i);
  });
  it("de hulp beantwoordt de vragen over voortgang, offline en niveaus, en linkt naar privacy en lesroutes", () => {
    for (const id of ["voortgang", "offline", "niveaus", "contact"]) expect(PAGINAS.hulp, id).toContain(`id="${id}"`);
    expect(PAGINAS.hulp).toContain('href="/bijbelreis/privacy"');
    expect(PAGINAS.hulp).toContain('href="/bijbelreis/lessen"');
  });
  it("bronnen en licenties staan op de hulppagina; de atlas heeft onderaan alleen de link", () => {
    const atlas = lees("bijbelreis.html");
    expect(atlas).toContain('<a href="/bijbelreis/hulp#bronnen">Bronnen en licenties</a>');
    expect(atlas).not.toContain("AWS Terrain Tiles");
    expect(atlas).not.toContain('class="colofon"');
    expect(PAGINAS.hulp).toContain('id="bronnen"');
    for (const zin of ["Wikimedia Commons", "Leaflet", "Natural Earth", "AWS Terrain Tiles", "Ancient World Mapping Center", "Open Database License 1.0", "Forti e.a. 2022", "OpenBible.info", "CC BY 4.0", "Statenvertaling", "CC0"]) expect(PAGINAS.hulp, zin).toContain(zin);
  });
  it("de atlas linkt onder ‘Voor ouders en leiders’ naar privacy en hulp", () => {
    const atlas = lees("bijbelreis.html");
    // Tot het einde van de lijst: binnen ‘Voor ouders en leiders’ staat nog een uitklapblok (verantwoording van de kaart).
    const ouders = atlas.slice(atlas.indexOf('<details class="parents">'), atlas.indexOf("</dl>", atlas.indexOf('<details class="parents">')));
    expect(ouders).toContain('href="/bijbelreis/privacy"');
    expect(ouders).toContain('href="/bijbelreis/hulp"');
  });
});

describe("bijbelreis.nl serveert /privacy en /hulp", () => {
  const FILES: Bestanden = { "/bijbelreis.html": ["text/html; charset=utf-8", "a1", btoa("<!doctype html><title>atlas</title>")] };
  for (const [n, html] of Object.entries(PAGINAS)) FILES[`/bijbelreis/${n}.html`] = ["text/html; charset=utf-8", n, Buffer.from(html).toString("base64")];
  const REGELS = [{ pattern: "/*", headers: { "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'" } }];
  const w = maakBijbelreisWorker(FILES, REGELS) as unknown as { fetch: (r: Request) => Promise<Response> };
  const haal = (p: string, init?: RequestInit) => w.fetch(new Request("https://bijbelreis.nl" + p, init));

  it("op het korte adres, met de beveiligingskoppen, ETag en HEAD", async () => {
    for (const n of ["privacy", "hulp"]) {
      const r = await haal("/" + n);
      expect(r.status, n).toBe(200);
      expect(r.headers.get("Content-Type")).toContain("text/html");
      expect(r.headers.get("X-Frame-Options")).toBe("DENY");
      expect(r.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
      expect(await r.text()).toContain(`<h1>${n === "privacy" ? "Privacy" : "Hulp"}</h1>`);
      expect((await haal("/" + n, { headers: { "If-None-Match": `"${n}"` } })).status).toBe(304);
      expect(await (await haal("/" + n, { method: "HEAD" })).text()).toBe("");
    }
  });
  it("het pad in de build en varianten verwijzen door naar het korte adres", async () => {
    for (const p of ["/bijbelreis/privacy", "/bijbelreis/privacy.html", "/privacy/", "/privacy.html"]) {
      const r = await haal(p);
      expect(r.status, p).toBe(301);
      expect(r.headers.get("Location"), p).toBe("https://bijbelreis.nl/privacy");
    }
    expect((await haal("/bijbelreis/hulp")).headers.get("Location")).toBe("https://bijbelreis.nl/hulp");
  });
  it("staan in de sitemap", async () => {
    const xml = await (await haal("/sitemap.xml")).text();
    expect(xml).toContain("<loc>https://bijbelreis.nl/privacy</loc>");
    expect(xml).toContain("<loc>https://bijbelreis.nl/hulp</loc>");
  });
  it("zonder de bestanden: 404, zoals elk onbekend adres", async () => {
    const leeg = maakBijbelreisWorker({ "/bijbelreis.html": FILES["/bijbelreis.html"] }, REGELS) as unknown as { fetch: (r: Request) => Promise<Response> };
    expect((await leeg.fetch(new Request("https://bijbelreis.nl/privacy"))).status).toBe(404);
  });
});
