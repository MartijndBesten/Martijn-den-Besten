// De Bijbelreis als installeerbare app (docs/bijbelreis-pwa/README.md): de service worker op de Worker van bijbelreis.nl
// en de versie per build (scripts/bijbelreis-pwa.mjs). De werking in de browser test e2e/bijbelreis-pwa.spec.ts.
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { maakBijbelreisWorker, type Bestanden } from "../worker/bijbelreis-app";
// @ts-expect-error -- gewoon JavaScript-bestand zonder typen
import { maakPwa, stempel } from "../scripts/bijbelreis-pwa.mjs";

describe("de service worker op bijbelreis.nl", () => {
  const FILES: Bestanden = {
    "/bijbelreis.html": ["text/html; charset=utf-8", "a1", btoa("<!doctype html><title>atlas</title>")],
    "/bijbelreis-sw.js": ["text/javascript; charset=utf-8", "s1", btoa("// sw")],
    "/bijbelreis/manifest.webmanifest": ["application/manifest+json", "m1", btoa("{}")],
  };
  const REGELS = [
    { pattern: "/*", headers: { "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'" } },
    { pattern: "/bijbelreis/*", headers: { "Cache-Control": "public, max-age=3600" } },
  ];
  const w = maakBijbelreisWorker(FILES, REGELS) as unknown as { fetch: (r: Request) => Promise<Response> };

  it("staat in de root, wordt altijd opnieuw gecontroleerd en houdt de beveiligingskoppen", async () => {
    const r = await w.fetch(new Request("https://bijbelreis.nl/bijbelreis-sw.js?schil=%2F"));
    expect(r.status).toBe(200);
    expect(r.headers.get("Content-Type")).toContain("javascript");
    expect(r.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
    expect(r.headers.get("Content-Security-Policy")).toBe("default-src 'self'; frame-ancestors 'none'");
    expect(r.headers.get("X-Frame-Options")).toBe("DENY");
    expect((await w.fetch(new Request("https://bijbelreis.nl/bijbelreis-sw.js", { headers: { "If-None-Match": '"s1"' } }))).status).toBe(304);
  });
  it("het manifest staat bij de eigen bestanden; andere bestanden in de root blijven 404", async () => {
    const m = await w.fetch(new Request("https://bijbelreis.nl/bijbelreis/manifest.webmanifest"));
    expect(m.status).toBe(200);
    expect(m.headers.get("Content-Type")).toBe("application/manifest+json");
    expect((await w.fetch(new Request("https://bijbelreis.nl/sw.js"))).status).toBe(404);
    expect((await w.fetch(new Request("https://bijbelreis.nl/bijbelreis-sw.js", { method: "POST" }))).status).toBe(405);
  });
});

describe("één versie per build", () => {
  let map = "";
  afterEach(() => map && rmSync(map, { recursive: true, force: true }));
  // Een kleine nagemaakte build: de pagina, twee scripts, stijlen met een lettertype, gegevens, een foto en de echte sw.
  function bouw() {
    map = mkdtempSync(join(tmpdir(), "bijbelreis-pwa-unit-"));
    const b = (p: string, inhoud: string) => { mkdirSync(join(map, p, ".."), { recursive: true }); writeFileSync(join(map, p), inhoud); };
    b("bijbelreis.html", `<!doctype html><html><head>\n<link rel="icon" href="/bijbelreis/favicon.svg" type="image/svg+xml" />\n<link rel="manifest" href="/bijbelreis/manifest.webmanifest" />\n<link rel="stylesheet" href="/bijbelreis/bijbelreis.css" />\n  </head><body><script src="/bijbelreis/app.js"></script><script src="/bijbelreis/inhoud/genesis.js"></script></body></html>`);
    b("bijbelreis/boekje.html", `<!doctype html><html><head></head><body><script src="/bijbelreis/app.js"></script></body></html>`);
    b("bijbelreis/app.js", "// app\n");
    b("bijbelreis/inhoud/genesis.js", "// genesis\n");
    b("bijbelreis/bijbelreis.css", `@font-face { src: url("/fonts/geist.woff2"); }`);
    b("fonts/geist.woff2", "font");
    b("bijbelreis/favicon.svg", "<svg/>");
    b("bijbelreis/manifest.webmanifest", "{}");
    for (const p of ["geo.json", "toen.json", "relief.json", "grenzen.json", "relief-regio.webp", "relief-kanaan.webp", "niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]) b("bijbelreis/" + p, p);
    b("bijbelreis/fotos/jericho-480.webp", "foto");
    cpSync("public/bijbelreis-sw.js", join(map, "bijbelreis-sw.js"));
    stempel(map);
    return maakPwa(map) as { versie: string; bestanden: number };
  }
  const lees = (p: string) => readFileSync(join(map, p), "utf8");
  const bouwBlok = () => JSON.parse(lees("bijbelreis-sw.js").match(/const BOUW = (\{.*\});/)![1]) as { versie: string; schil: [string, string][]; beelden: Record<string, string> };
  const h = (s: string, n: number) => createHash("sha256").update(s).digest("hex").slice(0, n);

  it("zet de versie in de pagina en de sw, met elk bestand en zijn inhoudshash", () => {
    const r = bouw();
    expect(lees("bijbelreis.html")).toContain(`<meta name="bijbelreis-versie" content="${r.versie}" />`);
    expect(lees("bijbelreis.html")).toContain(`src="/bijbelreis/app.js?v=${h("// app\n", 10)}"`);
    expect(lees("bijbelreis/boekje.html")).toContain(`src="/bijbelreis/app.js?v=${h("// app\n", 10)}"`);
    const bouwSw = bouwBlok();
    expect(bouwSw.versie).toBe(r.versie);
    const schil = Object.fromEntries(bouwSw.schil);
    expect(schil[`/bijbelreis/app.js?v=${h("// app\n", 10)}`]).toBe(h("// app\n", 10));
    expect(schil[`/bijbelreis/niveaus/b.js?v=${h("niveaus/b.js", 10)}`]).toBeTruthy();
    expect(schil["/fonts/geist.woff2"]).toBe(h("font", 16));
    expect(schil["/bijbelreis/manifest.webmanifest"]).toBe(h("{}", 16));
    expect(Object.keys(schil).some((k) => k.includes("/api") || k.includes("fotos/"))).toBe(false);
    expect(bouwSw.beelden).toEqual({ "/bijbelreis/fotos/jericho-480.webp": h("foto", 12) });
    // De sjabloon in public/ heeft geen bouwgegevens: zonder build doet de sw niets.
    expect(readFileSync("public/bijbelreis-sw.js", "utf8")).toContain("const BOUW = null;");
  });
  it("dezelfde bestanden geven dezelfde versie; één gewijzigd bestand geeft een nieuwe", () => {
    const eerst = bouw().versie;
    stempel(map);
    expect(maakPwa(map).versie).toBe(eerst);
    expect(lees("bijbelreis.html").match(/bijbelreis-versie/g)).toHaveLength(1);
    expect(lees("bijbelreis-sw.js").match(/BOUW:BEGIN/g)).toHaveLength(1);
    writeFileSync(join(map, "bijbelreis/niveaus/c.js"), "nieuw");
    stempel(map);
    const daarna = maakPwa(map).versie;
    expect(daarna).not.toBe(eerst);
    expect(lees("bijbelreis.html")).toContain(`"niveaus/c.js":"${h("nieuw", 10)}"`);
    expect(bouwBlok().schil.map(([p]) => p)).toContain(`/bijbelreis/niveaus/c.js?v=${h("nieuw", 10)}`);
  });
});
