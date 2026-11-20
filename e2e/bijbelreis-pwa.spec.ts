import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { zonderVoorscherm } from "./voorscherm";

zonderVoorscherm(test);

// De Bijbelreis als installeerbare app (docs/bijbelreis-pwa/README.md): manifest, service worker, offline en updates.
// De andere specs draaien met serviceWorkers: "block" (playwright.config.ts); deze zet ze aan.
// Lokaal: npm run build && npx vite preview --port 8901 --strictPort, dan
//   E2E_BASE_URL=http://localhost:8901 npx playwright test e2e/bijbelreis-pwa.spec.ts --trace off
// De updatetest start zelf een klein servertje met een kopie van dist/client, zodat hij een nieuwe build kan nabootsen
// zonder de server van de andere tests te raken.

test.use({ serviceWorkers: "allow", reducedMotion: "reduce" });
test.describe.configure({ mode: "serial" });

const lokaal = (base?: string) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test((base || "").replace(/\/$/, ""));
const zetNiveau = (page: Page) =>
  page.addInitScript(() => {
    if (sessionStorage.getItem("niveauGezet")) return;
    sessionStorage.setItem("niveauGezet", "1");
    localStorage.setItem("bijbelreis:niveau", JSON.stringify("c"));
    localStorage.setItem("bijbelreis:welkomWeg", "true");
  });
function fouten(page: Page) {
  const f: string[] = [];
  page.on("pageerror", (e) => f.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text())) f.push(m.text()); });
  return f;
}
const bestuurd = (page: Page) => page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });
const cacheInhoud = (page: Page) =>
  page.evaluate(async () => Object.fromEntries(await Promise.all((await caches.keys()).map(async (k) => [k, (await (await caches.open(k)).keys()).map((r) => { const u = new URL(r.url); return u.pathname + u.search; })] as const))));
const versie = (page: Page) => page.locator('meta[name="bijbelreis-versie"]').getAttribute("content");

test.describe("installeerbaar en offline (tegen de testserver)", () => {
  test.beforeEach(({ baseURL }, ti) => {
    test.skip(ti.project.name !== "desktop", "één keer, in het project desktop");
    test.skip(!lokaal(baseURL), "alleen lokaal: de atlas staat op productie op bijbelreis.nl/, niet op deze testserver");
  });

  test("manifest is geldig, gekoppeld en installeerbaar; pictogrammen kloppen", async ({ page, request }) => {
    await zetNiveau(page);
    await page.goto("/bijbelreis");
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(href).toBe("/bijbelreis/manifest.webmanifest");
    const r = await request.get(href!);
    expect(r.ok()).toBe(true);
    expect(r.headers()["content-type"]).toContain("application/manifest+json");
    const m = await r.json();
    expect(m).toMatchObject({ id: "/", name: "Op reis door de Bijbel", short_name: "Bijbelreis", lang: "nl", start_url: "/", scope: "/", display: "standalone" });
    // Kleuren uit de huisstijl (bijbelreis.css): achtergrond = papier, thema = nacht (zoals meta theme-color).
    expect(m.background_color).toBe("#f5f0e5");
    expect(m.theme_color).toBe("#243d70");
    expect(await page.locator('meta[name="theme-color"]').getAttribute("content")).toBe(m.theme_color);
    const css = readFileSync("public/bijbelreis/bijbelreis.css", "utf8");
    expect(css).toContain(`--nacht: ${m.theme_color}`);
    expect(css).toContain(`--papier: ${m.background_color}`);
    // Pictogrammen: 192 en 512, gewoon en maskable, echte PNG's van die maat.
    const soorten = m.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes} ${i.purpose}`).sort();
    expect(soorten).toEqual(["192x192 any", "192x192 maskable", "512x512 any", "512x512 maskable"]);
    for (const i of m.icons) {
      const png = await request.get(i.src);
      expect(png.ok(), i.src).toBe(true);
      const b = await png.body();
      expect(b.subarray(1, 4).toString()).toBe("PNG");
      expect(`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`).toBe(i.sizes);
    }
    // iOS: op het beginscherm als app, statusbalk over de kop (de kop houdt er zelf rekening mee), eigen titel.
    expect(await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute("content")).toBe("yes");
    expect(await page.locator('meta[name="mobile-web-app-capable"]').getAttribute("content")).toBe("yes");
    expect(await page.locator('meta[name="apple-mobile-web-app-title"]').getAttribute("content")).toBe("Bijbelreis");
    expect(await page.locator('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute("content")).toBe("black-translucent");
    expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toContain("viewport-fit=cover");
    expect((await request.get("/bijbelreis/apple-touch-icon.png")).ok()).toBe(true);
    // Chromium zelf: het manifest zonder fouten, en geen bezwaren tegen installeren.
    await bestuurd(page);
    const cdp = await page.context().newCDPSession(page);
    const am = await cdp.send("Page.getAppManifest");
    expect(am.errors).toEqual([]);
    const inst = await cdp.send("Page.getInstallabilityErrors");
    expect(inst.installabilityErrors.map((e) => e.errorId)).toEqual([]);
  });

  test("de service worker meldt zich aan, bewaart de schil en nooit /api", async ({ page }) => {
    const f = fouten(page);
    await zetNiveau(page);
    await page.goto("/bijbelreis#v26");
    await bestuurd(page);
    const reg = await page.evaluate(async () => { const r = (await navigator.serviceWorker.getRegistration())!; return { scope: r.scope, script: r.active!.scriptURL }; });
    expect(new URL(reg.scope).pathname).toBe("/");
    expect(new URL(reg.script).pathname).toBe("/bijbelreis-sw.js");
    const v = await versie(page);
    expect(v).toMatch(/^[0-9a-f]{12}$/);
    // Een verzoek naar /api (GET en POST) gaat langs de service worker heen en komt nergens in een cache.
    await page.evaluate(async () => {
      await fetch("/api/health").catch(() => null);
      await fetch("/api/bezoek", { method: "POST", body: "{}" }).catch(() => null);
    });
    const c = await cacheInhoud(page);
    expect(Object.keys(c).filter((k) => k.startsWith("bijbelreis-schil-"))).toEqual([`bijbelreis-schil-${v}`]);
    const alles = Object.values(c).flat();
    expect(alles.filter((u) => /^\/(api|beheer)(\/|$)/.test(u))).toEqual([]);
    // De schil: de pagina, app.js, de stijlen, kaartgegevens, alle drie de niveaus en de lettertypen.
    const schil = c[`bijbelreis-schil-${v}`];
    for (const p of [/^\/bijbelreis$/, /^\/bijbelreis\/app\.js\?v=/, /^\/bijbelreis\/bijbelreis\.css\?v=/, /^\/bijbelreis\/geo\.json\?v=/, /^\/bijbelreis\/relief-kanaan\.webp\?v=/, /^\/bijbelreis\/niveaus\/a\.js\?v=/, /^\/bijbelreis\/niveaus\/c\.js\?v=/, /^\/bijbelreis\/inhoud\/genesis\.js\?v=/, /^\/fonts\/geist\.woff2$/])
      expect(schil.some((u) => p.test(u)), String(p)).toBe(true);
    expect(f).toEqual([]);
  });

  test("offline: een eerder bekeken verhaal opent opnieuw, met kaart en foto; wat nog niet bekeken is, zegt dat netjes", async ({ page, context }) => {
    const f = fouten(page);
    await zetNiveau(page);
    await page.goto("/bijbelreis#v76");
    await bestuurd(page);
    // Gewoon verder kijken (nu via de service worker): de foto bij geschiedenis 76 en geschiedenis 26.
    await page.reload();
    const foto = page.locator(".verhaal .plaatsfoto img");
    await expect.poll(() => foto.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    const fotoSrc = await foto.evaluate((i: HTMLImageElement) => new URL(i.currentSrc).pathname);
    await expect.poll(async () => Object.values(await cacheInhoud(page)).flat().some((u) => u.startsWith(fotoSrc + "?h="))).toBe(true);
    await page.goto("/bijbelreis#v26");
    await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#vTitel")).toContainText("Droog door de Schelfzee");
    await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
    // De kaart: landen, het reliëf (beelden geladen) en de route.
    await expect.poll(() => page.locator("#map .land").count()).toBeGreaterThan(5);
    await expect.poll(() => page.locator("img.relief").evaluateAll((l) => l.length > 0 && l.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(page.locator(".pwa-melding")).toContainText("geen internet");
    // De service worker merkt de bewaarde pagina (navigator.onLine is op echte toestellen niet altijd betrouwbaar).
    expect(await page.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).serverTiming.map((t) => t.name))).toContain("bijbelreis-offline");
    // De eerder bekeken foto komt uit de bewaarplaats.
    await page.goto("/bijbelreis#v76");
    await expect.poll(() => page.locator(".verhaal .plaatsfoto img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    // Een stap waarvan de foto nog nooit bekeken is (Jericho): een korte zin in plaats van een leeg vlak.
    await page.goto("/bijbelreis#intocht/5");
    await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
    await expect(page.locator("#p-reis .stapkaart .pwa-geenfoto")).toHaveText("Deze foto kun je zien als je weer internet hebt.");
    // Het aanvraagformulier zegt dat versturen nu niet kan, en de tekst blijft staan.
    await page.evaluate(() => (document.querySelector("[data-aanvraag]") as HTMLElement).click());
    await page.locator("#avTekst").fill("Een test zonder internet.");
    await page.locator("#avStuur").click();
    await expect(page.locator("#avFout")).toContainText("niet verbonden met internet");
    await expect(page.locator("#avTekst")).toHaveValue("Een test zonder internet.");
    // Het boekje is niet bewaard: een eigen, rustige pagina in plaats van de foutpagina van de browser.
    await page.goto("/bijbelreis/boekje");
    await expect(page.locator("h1")).toHaveText("Even geen internet");
    await context.setOffline(false);
    expect(f).toEqual([]);
  });
});

// ---------- een nieuwe versie (eigen servertje met een kopie van de build) ----------
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8" };
const CSP = readFileSync("public/_headers", "utf8").match(/Content-Security-Policy: (.+)/)![1];
function server(map: string): Promise<{ url: string; stop: () => Promise<void> }> {
  const s: Server = createServer((req, res) => {
    const u = new URL(req.url!, "http://x");
    if (u.pathname.startsWith("/api/")) { res.writeHead(req.method === "POST" ? 204 : 404, { "Cache-Control": "no-store" }); return res.end(); }
    const pad = u.pathname === "/bijbelreis" ? "/bijbelreis.html" : u.pathname === "/bijbelreis/boekje" ? "/bijbelreis/boekje.html" : u.pathname;
    const vol = normalize(join(map, pad));
    if (!vol.startsWith(map) || !existsSync(vol) || !statSync(vol).isFile()) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("niet gevonden"); }
    res.writeHead(200, { "Content-Type": TYPES[extname(vol)] || "application/octet-stream", "Cache-Control": "public, max-age=0, must-revalidate", "Content-Security-Policy": CSP, "X-Frame-Options": "DENY" });
    res.end(readFileSync(vol));
  });
  return new Promise((klaar) => s.listen(0, "127.0.0.1", () => klaar({ url: `http://127.0.0.1:${(s.address() as AddressInfo).port}`, stop: () => new Promise((k) => s.close(() => k())) })));
}

test.describe("een nieuwe versie", () => {
  let map = "", srv: { url: string; stop: () => Promise<void> };
  test.beforeAll(async ({}, ti) => {
    if (ti.project.name !== "desktop") return;
    map = mkdtempSync(join(tmpdir(), "bijbelreis-pwa-"));
    for (const p of ["bijbelreis.html", "bijbelreis-sw.js", "bijbelreis", "fonts"]) cpSync(join("dist/client", p), join(map, p), { recursive: true });
    srv = await server(map);
  });
  test.afterAll(async () => { if (srv) await srv.stop(); if (map) rmSync(map, { recursive: true, force: true }); });

  test("komt in één keer binnen, met een rustige melding; geen gemengde versies; voortgang blijft", async ({ page, context }, ti) => {
    test.skip(ti.project.name !== "desktop", "één keer, in het project desktop");
    test.setTimeout(90_000);
    const f = fouten(page);
    await zetNiveau(page);
    await page.goto(srv.url + "/bijbelreis#v26");
    await bestuurd(page);
    // Wat voortgang, zoals de atlas die bewaart.
    await page.evaluate(() => { localStorage.setItem("bijbelreis:gezien", JSON.stringify(["genesis:0:0", "exodus:1:2"])); localStorage.setItem("bijbelreis:verhalen", JSON.stringify({ 26: 1 })); });
    const voortgang = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
    const oud = (await versie(page))!;
    const oudIndeling = await page.evaluate(() => [...document.scripts].map((s) => s.src).find((s) => s.includes("/indeling.js"))!);

    // Nieuwe build: één inhoudsbestand verandert; dezelfde stap als in npm run build.
    writeFileSync(join(map, "bijbelreis/indeling.js"), readFileSync(join(map, "bijbelreis/indeling.js"), "utf8") + "\n// nieuwe versie (test)\n");
    execFileSync(process.execPath, ["scripts/bijbelreis-pwa.mjs", map]);
    const nieuw = readFileSync(join(map, "bijbelreis.html"), "utf8").match(/name="bijbelreis-versie" content="([0-9a-f]+)"/)![1];
    expect(nieuw).not.toBe(oud);

    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())!.update(); });
    const melding = page.locator(".pwa-melding");
    await expect(melding).toContainText("Er is een nieuwe versie", { timeout: 30_000 });
    // De nieuwe set staat er al helemaal (atomair geladen vóór de wissel); de pagina draait nog op de oude.
    const c = await cacheInhoud(page);
    const bouw = JSON.parse(readFileSync(join(map, "bijbelreis-sw.js"), "utf8").match(/const BOUW = (\{.*\});/)![1]);
    expect(c[`bijbelreis-schil-${nieuw}`].sort()).toEqual(["/bijbelreis", ...bouw.schil.map((x: [string, string]) => x[0])].sort());
    expect(c[`bijbelreis-schil-${oud}`]).toBeTruthy();
    expect(await versie(page)).toBe(oud);

    await Promise.all([page.waitForEvent("load"), melding.getByRole("button", { name: "Vernieuwen" }).click()]);
    await expect.poll(() => versie(page)).toBe(nieuw);
    await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
    // Alleen de nieuwe schil is over, en alles wat de pagina laadde (scripts, stijlen, gegevens, lettertypen) staat erin:
    // niets van de oude versie gemengd.
    const na = await cacheInhoud(page);
    expect(Object.keys(na).filter((k) => k.startsWith("bijbelreis-schil-"))).toEqual([`bijbelreis-schil-${nieuw}`]);
    const geladen = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => new URL(e.name)).filter((u) => u.origin === location.origin && /^\/(bijbelreis\/.+\.(js|css|json)|bijbelreis\/relief.+\.webp|fonts\/)/.test(u.pathname)).map((u) => u.pathname + u.search));
    expect(geladen.length).toBeGreaterThan(40);
    expect(geladen.filter((u) => !na[`bijbelreis-schil-${nieuw}`].includes(u))).toEqual([]);
    expect(geladen.some((u) => u.startsWith("/bijbelreis/indeling.js?v=") && !oudIndeling.endsWith(u))).toBe(true);
    // Vraagt iets nog het oude adres (bijv. een ander tabblad op de oude versie), dan nooit de nieuwe inhoud eronder.
    const oudAdres = new URL(oudIndeling).pathname + new URL(oudIndeling).search;
    expect(await page.evaluate((u) => fetch(u).then((r) => r.status), oudAdres)).toBe(503);
    // De voortgang is er nog precies zo.
    const daarna = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
    for (const [k, v] of Object.entries(voortgang)) expect(daarna[k], k).toBe(v);
    // En de nieuwe versie werkt ook zonder internet.
    await context.setOffline(true);
    await page.reload();
    await expect.poll(() => versie(page)).toBe(nieuw);
    await expect(page.locator(".verhaal #vVertelling")).not.toBeEmpty();
    await context.setOffline(false);
    expect(f.filter((x) => !/503/.test(x))).toEqual([]);
  });
});

// ---------- veilige zones (notch en thuisbalk) ----------
// Een echte iPhone in app-modus is hier niet na te bootsen. Wel: de stijlen met vaste waarden voor env(safe-area-inset-*)
// laden (iPhone 14/15 staand: boven 47, onder 34; iPad liggend: boven 24, onder 20) en meten dat kop, onderbalk, blad en
// knoppen er niet onder vallen.
test.describe("veilige zones in app-modus (nagebootst)", () => {
  test.use({ serviceWorkers: "block" });
  async function metInzet(page: Page, inzet: { top: number; bottom: number }) {
    await page.route(/\/bijbelreis\/bijbelreis\.css/, async (route) => {
      const r = await route.fetch();
      const css = (await r.text()).replace(/env\(safe-area-inset-(top|bottom|left|right)(?:,\s*0px)?\)/g, (m, k: string) => `${k === "top" ? inzet.top : k === "bottom" ? inzet.bottom : 0}px`);
      await route.fulfill({ response: r, body: css });
    });
    await zetNiveau(page);
  }
  const vak = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; });

  test("telefoon 390×844: kop onder de notch, onderbalk en Verder boven de thuisbalk", async ({ page }, ti) => {
    test.skip(ti.project.name !== "mobiel", "telefoonmaat, in het project mobiel");
    await page.setViewportSize({ width: 390, height: 844 });
    await metInzet(page, { top: 47, bottom: 34 });
    await page.goto("/bijbelreis#v26");
    await expect(page.locator("#map .land").first()).toBeAttached();
    expect((await vak(page, ".kop-titel")).top).toBeGreaterThanOrEqual(47);
    const tabs = await vak(page, ".tabs button");
    expect(tabs.bottom).toBeLessThanOrEqual(844 - 34 + 0.5);
    expect(tabs.h).toBeGreaterThanOrEqual(44);
    // In de reis: het blad met Vorige/Verder staat boven de onderbalk.
    await page.goto("/bijbelreis#intocht/5");
    await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
    const verder = await vak(page, "#next");
    expect(verder.bottom).toBeLessThanOrEqual(tabs.top + 0.5);
    const kop = await vak(page, ".kop");
    expect((await vak(page, ".maptools")).top).toBeGreaterThanOrEqual(kop.bottom - 0.5);
    // De niveaukeuze klapt onder de kop open, niet eroverheen (stond vóór deze wijziging 41 px te hoog).
    await page.locator("#niveauBtn").click();
    await expect(page.locator("#niveauKeuze")).toBeVisible();
    expect((await vak(page, "#niveauKeuze")).top).toBeGreaterThanOrEqual(kop.bottom - 0.5);
  });

  test("iPad liggend 1180×820: kop onder de statusbalk, kaartknoppen boven de thuisbalk", async ({ page }, ti) => {
    test.skip(ti.project.name !== "desktop", "breed scherm, in het project desktop");
    await page.setViewportSize({ width: 1180, height: 820 });
    await metInzet(page, { top: 24, bottom: 20 });
    await page.goto("/bijbelreis#intocht/5");
    await expect(page.locator("#sTitle")).toHaveText(/^5\. /);
    expect((await vak(page, ".kop-titel")).top).toBeGreaterThanOrEqual(24);
    expect((await vak(page, ".tabs button")).top).toBeGreaterThanOrEqual(24);
    expect((await vak(page, "#mapbar")).bottom).toBeLessThanOrEqual(820 - 20);
    expect((await vak(page, ".mapacties")).bottom).toBeLessThanOrEqual(820 - 20);
    await page.locator("#niveauBtn").click();
    await expect(page.locator("#niveauKeuze")).toBeVisible();
    expect((await vak(page, "#niveauKeuze")).top).toBeGreaterThanOrEqual((await vak(page, ".kop")).bottom - 0.5);
  });
});
