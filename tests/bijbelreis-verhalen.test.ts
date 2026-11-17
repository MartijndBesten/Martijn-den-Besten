// Vindbaarheid: elke geschiedenis krijgt een gewone HTML-pagina (scripts/bijbelreis-verhalen.mjs) met inhoud uit
// dezelfde gegevens als de atlas, en bijbelreis.nl serveert ze op /verhaal/<nr>-<slug> (worker/bijbelreis-app.ts).
// Uitleg: docs/bijbelreis-vindbaar/README.md.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error: gewoon JavaScript-bestand zonder typen (scripts/)
import * as V from "../scripts/bijbelreis-verhalen.mjs";
import { maakBijbelreisWorker, type Bestanden } from "../worker/bijbelreis-app";

type G = { nr: number; t: string; ref: string; uitleg: string; betekenis?: string; wie?: string[] };
const PUB = join(__dirname, "..", "public");
const gegevens = V.laadGegevens(PUB) as { geschiedenissen: G[]; indeling: Record<number, [string, string, string?][]>; secties: [string, number, number][] };
const G = gegevens.geschiedenissen;
const paginas = V.maakPaginas(gegevens, readFileSync(join(PUB, "bijbelreis", "verhaal.css"))) as Record<string, string>;
const ont = (s: string) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const paginaVan = (g: G) => paginas[`bijbelreis/verhaal/${V.naam(g)}.html`];

describe("verhaalpagina's: één per geschiedenis, uit de gegevens van de atlas", () => {
  it("laadt alle geschiedenissen en de secties uit app.js", () => {
    expect(G.length).toBeGreaterThanOrEqual(150);
    // De secties dekken 1..laatste zonder gat.
    const gedekt = new Set(gegevens.secties.flatMap(([, a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i)));
    for (const g of G) expect(gedekt.has(g.nr), `sectie voor ${g.nr}`).toBe(true);
  });
  it("elke geschiedenis heeft precies één pagina met een uniek, net adres", () => {
    const namen = G.map((g) => V.naam(g) as string);
    expect(new Set(namen).size).toBe(G.length);
    for (const n of namen) expect(n).toMatch(/^\d+-[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const g of G) expect(paginaVan(g), `pagina ${g.nr}`).toBeTruthy();
    expect(Object.keys(paginas).length).toBe(G.length + 1); // plus het overzicht
    expect(V.slug("Daniël en ‘Gij zijt de Christus’!")).toBe("daniel-en-gij-zijt-de-christus");
  });
  it("de inhoud komt uit de gegevens: titel, verwijzing, vertelling, uitleg en wie", () => {
    for (const g of G) {
      const html = paginaVan(g), tekst = ont(html);
      expect(tekst).toContain(`<title>${g.t} — Bijbelreis</title>`);
      expect(tekst).toContain(`<h1 id="titel">${g.t}</h1>`);
      expect(tekst).toContain(`Lees in je Bijbel: <b>${g.ref}</b>`);
      // De vertelling staat er volledig en letterlijk, in de onderdelen van indeling.js.
      const delen = [...html.matchAll(/<h2>Wat de Bijbel vertelt<\/h2>([\s\S]*?)(?:<h2>|<p class="actie">)/g)][0][1];
      const alinea = [...delen.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => ont(m[1])).join(" ");
      expect(alinea.replace(/\s+/g, " ")).toBe(g.uitleg.replace(/\s+/g, " ").trim());
      if (g.betekenis) expect(tekst).toContain(`<p>${g.betekenis}</p>`);
      for (const w of g.wie || []) expect(tekst).toContain(w);
      expect(html).toContain(`<link rel="canonical" href="https://bijbelreis.nl/verhaal/${V.naam(g)}" />`);
      // De beschrijving is het begin van de vertelling.
      const besch = ont(/<meta name="description" content="([^"]*)"/.exec(html)![1]).replace(/ …$/, "");
      expect(g.uitleg.replace(/\s+/g, " ").startsWith(besch)).toBe(true);
      expect(besch.length).toBeLessThanOrEqual(170);
    }
  });
  it("de knop opent de juiste geschiedenis in de atlas (/#vNN op bijbelreis.nl)", () => {
    for (const g of G) {
      const hrefs = [...paginaVan(g).matchAll(/<a class="knop" href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const h of hrefs) expect(new URL(h, `https://bijbelreis.nl/verhaal/${V.naam(g)}`).href).toBe(`https://bijbelreis.nl/#v${g.nr}`);
    }
  });
  it("geen script, geen inline handlers en geen externe bronnen (CSP default-src 'self')", () => {
    for (const html of Object.values(paginas)) {
      expect(html).not.toMatch(/<script|\son[a-z]+=|<iframe/i);
      for (const [, u] of html.matchAll(/(?:src|href)="([^"]+)"/g)) expect(u.startsWith("http") ? u.startsWith("https://bijbelreis.nl/") : true, u).toBe(true);
    }
  });
  it("het overzicht linkt naar elke geschiedenis", () => {
    const html = paginas["bijbelreis/verhalen.html"];
    for (const g of G) expect(html).toContain(`href="verhaal/${V.naam(g)}"`);
  });
});

describe("bijbelreis.nl serveert de pagina's", () => {
  const FILES: Bestanden = { "/bijbelreis.html": ["text/html; charset=utf-8", "a1", btoa("<!doctype html><title>atlas</title>")] };
  for (const [p, html] of Object.entries(paginas)) FILES["/" + p] = ["text/html; charset=utf-8", "x", Buffer.from(html).toString("base64")];
  const REGELS = [{ pattern: "/*", headers: { "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'" } }];
  const w = maakBijbelreisWorker(FILES, REGELS) as unknown as { fetch: (r: Request) => Promise<Response> };
  const haal = (p: string) => w.fetch(new Request("https://bijbelreis.nl" + p));
  const g26 = G.find((g) => g.nr === 26)!, adres = `/verhaal/${V.naam(g26)}`;

  it("een geschiedenis op /verhaal/<nr>-<slug>, met de beveiligingskoppen", async () => {
    const r = await haal(adres);
    expect(r.status).toBe(200);
    expect(r.headers.get("Content-Type")).toContain("text/html");
    expect(r.headers.get("X-Frame-Options")).toBe("DENY");
    expect(r.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(await r.text()).toContain(`<h1 id="titel">${g26.t}</h1>`);
  });
  it("een kort, oud of buildadres verwijst door naar het ene vaste adres", async () => {
    for (const p of ["/verhaal/26", "/verhaal/26-oude-titel", adres + "/", `/bijbelreis${adres}.html`, `/bijbelreis${adres}`]) {
      const r = await haal(p);
      expect(r.status, p).toBe(301);
      expect(r.headers.get("Location"), p).toBe("https://bijbelreis.nl" + adres);
    }
    expect((await haal("/verhaal/999-bestaat-niet")).status).toBe(404);
    expect((await haal("/verhaal/")).status).toBe(404);
  });
  it("het overzicht op /verhalen", async () => {
    expect((await haal("/verhalen")).status).toBe(200);
    for (const p of ["/verhalen/", "/bijbelreis/verhalen", "/bijbelreis/verhalen.html"]) expect((await haal(p)).headers.get("Location"), p).toBe("https://bijbelreis.nl/verhalen");
  });
  it("sitemap.xml noemt de atlas, het overzicht en elke geschiedenis; robots.txt wijst ernaar", async () => {
    const xml = await (await haal("/sitemap.xml")).text();
    expect(xml).toContain("<loc>https://bijbelreis.nl/</loc>");
    expect(xml).toContain("<loc>https://bijbelreis.nl/verhalen</loc>");
    for (const g of G) expect(xml).toContain(`<loc>https://bijbelreis.nl/verhaal/${V.naam(g)}</loc>`);
    expect((xml.match(/<url>/g) || []).length).toBe(G.length + 2);
    expect(await (await haal("/robots.txt")).text()).toContain("Sitemap: https://bijbelreis.nl/sitemap.xml");
  });
  it("de atlas zelf blijft op /", async () => {
    expect(await (await haal("/")).text()).toContain("atlas");
  });
});
