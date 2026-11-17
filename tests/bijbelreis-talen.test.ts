// Talen van de Bijbelreis (docs/bijbelreis-talen/README.md): de Engelse proef op /en/. De werking in de browser test
// e2e/bijbelreis-engels.spec.ts.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { maakBijbelreisWorker, type Bestanden } from "../worker/bijbelreis-app";
import { BIJBELREIS_TALEN } from "../shared/bijbelreis";
// @ts-expect-error -- gewoon JavaScript-bestand zonder typen
import { controleer } from "../scripts/bijbelreis-talen-controle.mjs";
// @ts-expect-error -- idem
import { laadBoek, maakTaalPagina, vertaalHtml, zetTaalkeuzeNl, maakTalen } from "../scripts/bijbelreis-talen.mjs";
// @ts-expect-error -- idem
import { nederlandseWoorden } from "../scripts/bijbelreis-talen-woorden.mjs";
// @ts-expect-error -- idem
import { kjvTekst, refFout } from "../scripts/bijbelreis-kjv.mjs";
// @ts-expect-error -- idem
import { laadGegevens, maakPaginas } from "../scripts/bijbelreis-verhalen.mjs";
// @ts-expect-error -- idem
import { maakPwa, stempel } from "../scripts/bijbelreis-pwa.mjs";

const NL_HTML = readFileSync("public/bijbelreis.html", "utf8");
const boek = laadBoek("public", "en");
// Zichtbare tekst van een stuk HTML, zonder wat expliciet Nederlands is (lang="nl", de link terug).
const tekstVan = (html: string) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<a [^>]*lang="nl"[^>]*>[^<]*<\/a>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("de Engelse inhoud", () => {
  const { fouten, aantallen } = controleer("public", "en");
  it("sleutels, geen Nederlands, verwijzingen in de KJV en citaten letterlijk uit de KJV", () => {
    expect(fouten).toEqual([]);
  });
  it("tien geschiedenissen op alle drie de niveaus, met hun stappen, personen en alle plaatsnamen", () => {
    expect(aantallen.geschiedenissen).toBe(10);
    expect(aantallen.delen).toBe(10);
    expect(aantallen.stappenVolledig).toBeGreaterThanOrEqual(19);
    expect(aantallen.citaten).toBeGreaterThan(250);
    expect(aantallen.verwijzingen).toBeGreaterThan(500);
    expect(aantallen.plaatsen).toBe(311);
    expect(aantallen.personen).toBeGreaterThanOrEqual(15);
  });
});

describe("de KJV als controletekst", () => {
  it("66 boeken met de Godsnaam zoals gedrukt (LORD) en KJV-versnummering", () => {
    expect(kjvTekst("Exodus 14:13")).toContain("see the salvation of the LORD");
    expect(kjvTekst("Jonah 1:17")).toContain("great fish");
    // In de Statenvertaling is dit Daniël 6:23; de KJV telt in Daniël 6 één vers minder.
    expect(kjvTekst("Daniel 6:22")).toContain("My God hath sent his angel");
    // Psalmopschriften zijn in de KJV geen vers.
    expect(kjvTekst("Psalm 23:1")).toBe("The LORD is my shepherd; I shall not want.");
    expect(refFout("Daniel 6:29")).toMatch(/28 verzen/);
    expect(refFout("Revelation 22:21")).toBeNull();
  });
});

describe("het woordenboek", () => {
  it("elk patroon staat vast aan begin en eind, en geen Engelse tekst bevat Nederlands", () => {
    for (const [re] of boek.patronen) expect(String(re)).toMatch(/^\/\^.*\$\/[a-z]*$/);
    for (const [k, v] of Object.entries(boek.woorden as Record<string, string>)) expect(nederlandseWoorden(v), `${k} → ${v}`).toEqual([]);
  });
});

describe("de Engelse atlas (/en/)", () => {
  const { html, ontbreekt } = maakTaalPagina(NL_HTML, "en", boek, { openbaar: false, talen: ["en"] });
  it("alle vaste teksten zijn vertaald", () => {
    expect(ontbreekt).toEqual([]);
    expect(nederlandseWoorden(tekstVan(html.slice(html.indexOf("<body"))))).toEqual([]);
  });
  it("taal, canonical, hreflang en noindex zolang de taal een proef is", () => {
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('<link rel="canonical" href="https://bijbelreis.nl/en/" />');
    expect(html).toContain('<link rel="alternate" hreflang="nl" href="https://bijbelreis.nl/" />');
    expect(html).toContain('<link rel="alternate" hreflang="en" href="https://bijbelreis.nl/en/" />');
    expect(html).toContain('<link rel="alternate" hreflang="x-default" href="https://bijbelreis.nl/" />');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toContain('href="/bijbelreis/taal/en/manifest.webmanifest"');
    expect(BIJBELREIS_TALEN.en.openbaar).toBe(false);
    expect(maakTaalPagina(NL_HTML, "en", boek, { openbaar: true }).html).toContain('<meta name="robots" content="index, follow" />');
  });
  it("laadt het woordenboek vóór de rest, de taallaag vlak vóór app.js, en niet wat (nog) niet vertaald is", () => {
    const src = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]);
    expect(src.slice(0, 2)).toEqual(["taal/en.js", "taal/taal.js"]);
    expect(src.slice(-5)).toEqual(["taal/en/inhoud.js", "taal/en/stappen.js", "taal/en/verhalen.js", "taal/laag.js", "app.js"]);
    expect(src.indexOf("taal/laag.js")).toBe(src.indexOf("app.js") - 1);
    expect(src.indexOf("taal/en/inhoud.js")).toBeGreaterThan(src.indexOf("niveaus.js"));
    for (const weg of ["vandaag.js", "fotos.js", "seizoen.js", "wereld/ingang.js", "inhoud/kerst.js", "taferelen.js"]) expect(src).not.toContain(weg);
    expect(html).toContain('<html lang="en"');
  });
  it("de proefmelding en de weg terug naar het Nederlands", () => {
    expect(html).toMatch(/class="taal-proef"[^>]*><b>Review draft\.<\/b>/);
    expect(html).toMatch(/<a data-taal="nl" href="\/" hreflang="nl" lang="nl">Nederlandse versie<\/a>/);
  });
  it("vertaalt niets twee keer en laat onbekende tekst staan (zodat de controle hem vindt)", () => {
    const r = vertaalHtml("<body><p>Verder ▶</p><p>Een onbekende zin.</p></body>", { ...boek, blokken: [] });
    expect(r.html).toContain("<p>Next ▶</p>");
    expect(r.ontbreekt).toEqual(["Een onbekende zin."]);
  });
});

describe("de Nederlandse pagina blijft zoals hij was", () => {
  let map = "";
  afterAll(() => map && rmSync(map, { recursive: true, force: true }));
  it("zonder openbare taal: byte voor byte gelijk, geen taalkeuze en geen hreflang", () => {
    map = mkdtempSync(join(tmpdir(), "bijbelreis-talen-"));
    writeFileSync(join(map, "bijbelreis.html"), NL_HTML);
    maakTalen(map, "public");
    expect(readFileSync(join(map, "bijbelreis.html"), "utf8")).toBe(NL_HTML);
    expect(existsSync(join(map, "bijbelreis", "en", "index.html"))).toBe(true);
    const m = JSON.parse(readFileSync(join(map, "bijbelreis", "taal", "en", "manifest.webmanifest"), "utf8"));
    expect(m).toMatchObject({ lang: "en", start_url: "/en/", scope: "/en/", id: "/en/" });
  });
  it("met een openbare taal: taalkeuze bij ‘Voor ouders en leiders’ en hreflang", () => {
    const nl = zetTaalkeuzeNl(NL_HTML, ["en"]);
    expect(nl).toContain('hreflang="x-default"');
    expect(nl).toContain('<a data-taal="en" href="/en/" hreflang="en" lang="en">English</a>');
    expect(nl.indexOf('class="taal-nl"')).toBeLessThan(nl.indexOf('<details class="parents">'));
  });
});

describe("de Engelse verhaalpagina's", () => {
  const paginas = maakPaginas(laadGegevens("public", "en"), "css", { taal: "en", openbaar: false }) as Record<string, string>;
  const namen = Object.keys(paginas);
  it("één pagina per vertaalde geschiedenis en een overzicht, onder /en/", () => {
    expect(namen.filter((p) => p.startsWith("bijbelreis/en/verhaal/"))).toHaveLength(10);
    expect(namen).toContain("bijbelreis/en/verhalen.html");
    expect(namen).toContain("bijbelreis/en/verhaal/26-dry-through-the-red-sea.html");
  });
  it("Engels, noindex, canonical en hreflang naar de Nederlandse pagina, zonder Nederlands", () => {
    const p = paginas["bijbelreis/en/verhaal/26-dry-through-the-red-sea.html"];
    expect(p).toContain('<html lang="en">');
    expect(p).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(p).toContain('<link rel="canonical" href="https://bijbelreis.nl/en/verhaal/26-dry-through-the-red-sea" />');
    expect(p).toContain('<link rel="alternate" hreflang="nl" href="https://bijbelreis.nl/verhaal/26" />');
    expect(p).toContain('href="../#v26"');
    expect(p).toContain("Open this history in the Bible Journey");
    for (const [n, h] of Object.entries(paginas)) expect(nederlandseWoorden(tekstVan(h)), n).toEqual([]);
  });
});

describe("de Worker van bijbelreis.nl", () => {
  const b = (s: string) => btoa(unescape(encodeURIComponent(s)));
  const FILES: Bestanden = {
    "/bijbelreis.html": ["text/html; charset=utf-8", "a1", b("<!doctype html><html lang=\"nl\">")],
    "/bijbelreis/en/index.html": ["text/html; charset=utf-8", "e1", b("<!doctype html><html lang=\"en\">")],
    "/bijbelreis/en/verhalen.html": ["text/html; charset=utf-8", "e2", b("overzicht")],
    "/bijbelreis/en/verhaal/26-dry-through-the-red-sea.html": ["text/html; charset=utf-8", "e3", b("26")],
    "/bijbelreis/verhaal/26-droog-door-de-schelfzee.html": ["text/html; charset=utf-8", "n3", b("26")],
    "/bijbelreis-sw-en.js": ["text/javascript; charset=utf-8", "s2", b("// sw")],
  };
  const REGELS = [{ pattern: "/*", headers: { "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'" } }];
  const proef = maakBijbelreisWorker(FILES, REGELS, {}, { en: { naam: "English", openbaar: false } }) as unknown as { fetch: (r: Request) => Promise<Response> };
  const open = maakBijbelreisWorker(FILES, REGELS, {}, { en: { naam: "English", openbaar: true } }) as unknown as { fetch: (r: Request) => Promise<Response> };
  const get = (w: typeof proef, p: string) => w.fetch(new Request("https://bijbelreis.nl" + p));
  it("/en/ is de Engelse atlas, met noindex zolang de taal een proef is, en met de gewone beveiligingskoppen", async () => {
    const r = await get(proef, "/en/");
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('lang="en"');
    expect(r.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(r.headers.get("X-Frame-Options")).toBe("DENY");
    expect((await get(open, "/en/")).headers.get("X-Robots-Tag")).toBeNull();
    expect((await get(proef, "/")).headers.get("X-Robots-Tag")).toBeNull();
  });
  it("één vast adres: /en, /bijbelreis/en/ en /en/verhaal/26 verwijzen door", async () => {
    for (const [van, naar] of [["/en", "/en/"], ["/bijbelreis/en/", "/en/"], ["/bijbelreis/en/index.html", "/en/"], ["/en/verhaal/26", "/en/verhaal/26-dry-through-the-red-sea"], ["/en/verhaal/26-oude-titel", "/en/verhaal/26-dry-through-the-red-sea"], ["/bijbelreis/en/verhalen.html", "/en/verhalen"]]) {
      const r = await get(proef, van);
      expect(r.status, van).toBe(301);
      expect(new URL(r.headers.get("Location")!).pathname, van).toBe(naar);
    }
    expect((await get(proef, "/en/verhaal/26-dry-through-the-red-sea")).status).toBe(200);
    expect((await get(proef, "/en/verhalen")).status).toBe(200);
    expect((await get(proef, "/en/verhaal/999")).status).toBe(404);
    expect((await get(proef, "/de/")).status).toBe(404);
  });
  it("de eigen service worker van de taal staat in de root", async () => {
    const r = await get(proef, "/bijbelreis-sw-en.js");
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
  });
  it("de sitemap noemt /en/ pas als de taal openbaar is", async () => {
    const s1 = await (await get(proef, "/sitemap.xml")).text();
    expect(s1).not.toContain("/en/");
    expect(s1).toContain("https://bijbelreis.nl/verhaal/26-droog-door-de-schelfzee");
    const s2 = await (await get(open, "/sitemap.xml")).text();
    expect(s2).toContain("https://bijbelreis.nl/en/");
    expect(s2).toContain("https://bijbelreis.nl/en/verhalen");
    expect(s2).toContain("https://bijbelreis.nl/en/verhaal/26-dry-through-the-red-sea");
  });
});

describe("app en offline: een eigen set per taal", () => {
  let map = "";
  afterAll(() => map && rmSync(map, { recursive: true, force: true }));
  it("de Engelse pagina krijgt een eigen service worker, versie en cache; de Nederlandse set blijft gelijk", () => {
    map = mkdtempSync(join(tmpdir(), "bijbelreis-talen-pwa-"));
    const b = (p: string, inhoud: string) => { mkdirSync(join(map, p, ".."), { recursive: true }); writeFileSync(join(map, p), inhoud); };
    b("bijbelreis.html", `<!doctype html><html lang="nl"><head>\n<link rel="manifest" href="/bijbelreis/manifest.webmanifest" />\n  </head><body><script src="/bijbelreis/app.js"></script></body></html>`);
    b("bijbelreis/en/index.html", `<!doctype html><html lang="en"><head>\n<link rel="manifest" href="/bijbelreis/taal/en/manifest.webmanifest" />\n  </head><body><script src="/bijbelreis/taal/en.js"></script><script src="/bijbelreis/app.js"></script></body></html>`);
    b("bijbelreis/app.js", "// app\n");
    b("bijbelreis/taal/en.js", "// en\n");
    b("bijbelreis/manifest.webmanifest", "{}");
    b("bijbelreis/taal/en/manifest.webmanifest", "{\"lang\":\"en\"}");
    for (const p of ["geo.json", "toen.json", "relief.json", "grenzen.json", "relief-regio.webp", "relief-kanaan.webp", "niveaus/a.js", "niveaus/b.js", "niveaus/c.js", "taal/en/niveaus/a.js", "taal/en/niveaus/b.js", "taal/en/niveaus/c.js"]) b("bijbelreis/" + p, p);
    cpSync("public/bijbelreis-sw.js", join(map, "bijbelreis-sw.js"));
    stempel(map);
    const nl = maakPwa(map, "nl"), en = maakPwa(map, "en");
    expect(nl.versie).not.toBe(en.versie);
    const sw = readFileSync(join(map, "bijbelreis-sw.js"), "utf8"), swEn = readFileSync(join(map, "bijbelreis-sw-en.js"), "utf8");
    const bouw = (s: string) => JSON.parse(s.match(/const BOUW = (\{.*\});/)![1]);
    expect(bouw(sw).taal).toBeUndefined();
    expect(bouw(swEn).taal).toBe("en");
    const schilEn = bouw(swEn).schil.map(([p]: [string]) => p).join(" "), schilNl = bouw(sw).schil.map(([p]: [string]) => p).join(" ");
    expect(schilEn).toContain("/bijbelreis/taal/en/niveaus/b.js");
    expect(schilEn).not.toContain("/bijbelreis/niveaus/b.js");
    expect(schilNl).not.toContain("/taal/");
    // Een wijziging in het Engels verandert de Nederlandse versie niet.
    writeFileSync(join(map, "bijbelreis/taal/en/niveaus/b.js"), "nieuw");
    stempel(map);
    expect(maakPwa(map, "nl").versie).toBe(nl.versie);
    expect(maakPwa(map, "en").versie).not.toBe(en.versie);
    // De sjabloon kent per taal een eigen cache en het pad van de taal.
    const sjabloon = readFileSync("public/bijbelreis-sw.js", "utf8");
    expect(sjabloon).toContain('"bijbelreis-" + TAAL + "-schil-"');
    expect(sjabloon).toContain('const SCHIL_VOORVOEGSEL = TAAL === "nl" ? "bijbelreis-schil-"');
  });
});
