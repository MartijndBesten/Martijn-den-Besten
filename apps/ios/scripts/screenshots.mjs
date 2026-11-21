// Browserweergaven (Chromium, Playwright) van de webmap van de app (www/), om snel te vergelijken. Geen simulatorbeelden.
// Dit zijn browserweergaven van dezelfde app-inhoud, niet de echte iOS-webview: zonder statusbalk en zonder notch.
// Wijkt iets af, maak ze dan in de Simulator (Cmd+S). Zie docs/bijbelreis-ios/APPSTORE.md.
//
//   node scripts/maak-webmap.mjs && node scripts/screenshots.mjs [poort]
//
// Maten (App Store Connect, screenshot specifications, 17-11-2026): iPhone 6,9" 1320×2868 (440×956 @3), iPhone 6,3"
// 1206×2622 (402×874 @3; Apple noemt ‘iPhone with Dynamic Island (medium display)’ verplicht) en iPad 13" 2064×2752
// (1032×1376 @2).
// De voortgang is verzonnen: de script loopt zelf een paar reizen en geschiedenissen door, zoals een kind dat zou doen.
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const APP = join(hier, "..");
const WWW = join(APP, "www");
// Niet in store/screenshots: daar staan de echte simulatorbeelden (workflow iOS-app, artefact simulator-schermafbeeldingen).
const UIT = join(APP, "store", "screenshots-browser");
const { chromium } = createRequire(join(APP, "..", "..", "package.json"))("playwright");
const sharp = createRequire(join(APP, "..", "..", "package.json"))("sharp");
const POORT = Number(process.argv[2] || 8925);
if (!existsSync(join(WWW, "index.html"))) throw new Error("Eerst: node scripts/maak-webmap.mjs");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
const server = createServer((req, res) => {
  const pad = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = normalize(join(WWW, pad === "/" || !extname(pad) ? "index.html" : pad));
  if (!f.startsWith(WWW) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((k) => server.listen(POORT, "127.0.0.1", k));
const BASIS = `http://localhost:${POORT}/`;

const TOESTELLEN = [
  { map: "iphone-6.9", viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, maat: [1320, 2868] },
  { map: "iphone-6.3", viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, maat: [1206, 2622] },
  { map: "ipad-13", viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, maat: [2064, 2752] },
];
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

async function rustig(page) {
  // Wacht tot kaart en beelden er zijn; tijdelijke meldingen (‘Nieuwe stempel’) horen niet in een schermafbeelding.
  await page.waitForFunction(() => document.querySelectorAll("#map .leaflet-overlay-pane path, #map .leaflet-marker-icon").length > 5, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1600);
  await page.addStyleTag({ content: ".toast{display:none!important}" });
  // Geen focusring of uitleg-wolkje van een tabblad dat net is aangetikt.
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.mouse.move(1, 1).catch(() => {});
  await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((k) => { i.onload = i.onerror = k; }))));
  await page.waitForTimeout(300);
}

const browser = await chromium.launch();
const gemaakt = [];
try {
  for (const t of TOESTELLEN) {
    const map = join(UIT, t.map);
    rmSync(map, { recursive: true, force: true });
    mkdirSync(map, { recursive: true });
    const ctx = await browser.newContext({ viewport: t.viewport, deviceScaleFactor: t.deviceScaleFactor, isMobile: t.isMobile, hasTouch: t.hasTouch, userAgent: UA, reducedMotion: "reduce" });
    await ctx.route("**/*", (r) => (r.request().url().startsWith(BASIS) ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    const fouten = [];
    page.on("pageerror", (e) => fouten.push(e.message));
    const ga = async (hash) => { await page.goto(BASIS + hash); await page.waitForTimeout(700); };
    const foto = async (naam) => { await rustig(page); const p = join(map, naam + ".png"); await page.screenshot({ path: p }); gemaakt.push([p, t.maat]); };

    // Verzonnen voortgang: een lezer van ‘Zelf lezen’ las een paar geschiedenissen en liep een stuk met Abraham mee.
    await page.goto(BASIS);
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem("bijbelreis:niveau", JSON.stringify("b")); });
    for (const h of ["#v1", "#v2", "#v3", "#v5", "#v8", "#abraham/1", "#abraham/2", "#abraham/3", "#abraham/4", "#abraham/5", "#abraham/6", "#abraham/7", "#uittocht/1", "#uittocht/2", "#uittocht/3"]) await ga(h);

    // 1. Een geschiedenis: tekst, Bijbelplaats en kaart.
    await ga("#v26");
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    await foto("1-verhaal");
    // 2. Een reis op de kaart, met een eigen tekening bij de stap (tafereel).
    await ga("#uittocht/6");
    await page.waitForSelector(".tafereel", { state: "attached" });
    // Op de telefoon staat de tekening in het reisblad: open het blad en zet de tekening in beeld.
    if (await page.locator("#bladBtn").isVisible()) {
      await page.locator("#bladBtn").tap();
      await page.waitForTimeout(700);
      await page.locator(".tafereel").first().evaluate((e) => e.scrollIntoView({ block: "center" }));
    }
    await foto("2-reis-tafereel");
    // 3. Wie is wie.
    await ga("#abraham/7");
    await page.locator("#t-wie").tap();
    await foto("3-wie-is-wie");
    // 4. Speurtocht, met het oordeel na een goed antwoord.
    // Een vraag met één goed antwoord (de volgorde is willekeurig; zo nodig opnieuw beginnen).
    let beantwoord = false;
    for (let poging = 0; poging < 15 && !beantwoord; poging++) {
      await ga("#abraham");
      await page.locator("#t-quiz").tap();
      await page.locator("#qGo").tap();
      await page.waitForSelector("#p-quiz .qtext");
      if (await page.locator("#qUndo").count()) continue;
      const q = (await page.locator("#p-quiz .qtext").textContent()).trim();
      const goed = await page.evaluate((q) => { for (const lv of Object.values(BR.niveaus.verhalen)) for (const v of Object.values(lv || {})) for (const x of v?.vragen || []) if (x.q === q) return x.a[0]; return null; }, q);
      const opts = (await page.locator("#p-quiz .opt").allTextContents()).map((x) => x.trim());
      if (!goed || !opts.includes(goed)) continue;
      await page.locator("#p-quiz .opt").nth(opts.indexOf(goed)).tap();
      await page.waitForSelector("#qRes .feedback.ok");
      beantwoord = true;
    }
    if (!beantwoord) throw new Error("geen speurtochtvraag met één goed antwoord gevonden");
    await foto("4-speurtocht");
    // 5. Paspoort, met ‘Hier was je’.
    await ga("#abraham/7");
    await page.locator("#t-pas").tap();
    await page.waitForSelector("#pasVerder .pv-tekst");
    await page.evaluate(() => window.scrollTo(0, 0));
    await foto("5-paspoort");
    if (fouten.length) throw new Error("fouten in de pagina: " + fouten.join(" | "));
    await ctx.close();
  }
  for (const [p, [w, h]] of gemaakt) {
    const m = await sharp(p).metadata();
    if (m.width !== w || m.height !== h) throw new Error(`${p}: ${m.width}×${m.height}, verwacht ${w}×${h}`);
    // App Store Connect wil geen transparantie: JPEG (RGB, geen alfakanaal), veel kleiner dan PNG.
    const jpg = p.replace(/\.png$/, ".jpg");
    await sharp(p).flatten({ background: "#f5f0e5" }).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(jpg);
    rmSync(p);
    console.log(`ok  ${jpg.slice(APP.length + 1)}  ${w}×${h}`);
  }
} finally {
  await browser.close();
  server.close();
}
