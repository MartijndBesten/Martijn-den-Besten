// Test van de webmap van de iOS-app, zonder Mac: een eenvoudige statische server op de webmap en Playwright met een
// iPhone-maat. Standaard Chromium; met BROWSER=webkit de WebKit van Playwright (dichter bij WKWebView, zo draait hij in
// .github/workflows/ios.yml). Dit test de atlas met de app-laag, NIET de echte iOS-webview: dat doet de simulator-test
// (scripts/simulator-test.mjs, op een Mac in GitHub Actions); zie README.md.
//
//   node scripts/maak-webmap.mjs && [BROWSER=webkit] node scripts/test-webmap.mjs [poort] [map-voor-schermafbeeldingen]
//
// Playwright komt uit de node_modules van de repository (npm ci in de hoofdmap).
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const app = join(hier, "..");
const www = join(app, "www");
const repo = join(app, "..", "..");
const pw = createRequire(join(repo, "package.json"))("playwright");
const MOTOR = process.env.BROWSER || "chromium";
if (!["chromium", "webkit"].includes(MOTOR)) throw new Error("BROWSER moet chromium of webkit zijn");
const POORT = Number(process.argv[2] || 8906);
const SHOTS = process.argv[3] || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
if (!existsSync(join(www, "index.html"))) throw new Error("Eerst: node scripts/maak-webmap.mjs");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
const apiVerzoeken = [];
const server = createServer((req, res) => {
  const pad = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (pad.startsWith("/api/")) { apiVerzoeken.push(req.method + " " + pad); res.writeHead(404); res.end(); return; }
  // Zoals de router van Capacitor (Router.swift): een adres zonder extensie geeft index.html.
  let bestand = normalize(join(www, pad === "/" || !extname(pad) ? "index.html" : pad));
  if (!bestand.startsWith(www) || !existsSync(bestand) || statSync(bestand).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(bestand)] || "application/octet-stream" });
  createReadStream(bestand).pipe(res);
});
await new Promise((k) => server.listen(POORT, "127.0.0.1", k));
const BASIS = `http://localhost:${POORT}/`;

const IPHONE = {
  viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
};
const GETAL = { dertien: 13, veertien: 14, vijftien: 15, zestien: 16, zeventien: 17, achttien: 18, negentien: 19, twintig: 20 };
["een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen"].forEach((w, i) => { GETAL[w] = i + 1; GETAL[w + (/[ae]$/.test(w) ? "ëntwintig" : "entwintig")] = 21 + i; });
const somUit = (tekst) => { const m = /hoeveel is (\S+) keer (\S+)\?/.exec(tekst); return GETAL[m[1]] * GETAL[m[2]]; };

const resultaten = [];
let mislukt = 0;
async function stap(naam, fn) {
  try { await fn(); resultaten.push("ok    " + naam); }
  catch (e) { mislukt++; resultaten.push("FOUT  " + naam + "\n      " + String(e && e.message || e).split("\n")[0]); }
}
const verwacht = (ok, wat) => { if (!ok) throw new Error(wat); };

// Een nagebootste Capacitor (Preferences en Share) met opslag in Node: zo blijft de ‘reservekopie’ bestaan tussen twee
// browsercontexten, zoals UserDefaults blijft bestaan als iOS de opslag van de webview opruimt.
async function maakContext(browser, prefs, gedeeld) {
  const ctx = await browser.newContext(IPHONE);
  const extern = [];
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(BASIS)) return route.continue();
    extern.push(u); return route.abort();
  });
  if (prefs) {
    await ctx.exposeFunction("__prefGet", (k) => (prefs.has(k) ? prefs.get(k) : null));
    await ctx.exposeFunction("__prefSet", (k, v) => { prefs.set(k, v); });
    await ctx.exposeFunction("__deel", (o) => { gedeeld.push(o); });
    await ctx.addInitScript(() => {
      window.Capacitor = { Plugins: {
        Preferences: { get: async ({ key }) => ({ value: await window.__prefGet(key) }), set: async ({ key, value }) => { await window.__prefSet(key, value); } },
        Share: { share: async (o) => { await window.__deel(o); return {}; } },
      } };
    });
  }
  // Telt hoe vaak het document echt (opnieuw) laadt; hashwissels tellen niet mee.
  await ctx.addInitScript(() => { try { sessionStorage.setItem("__ladingen", String(Number(sessionStorage.getItem("__ladingen") || 0) + 1)); } catch (e) { /* niets */ } });
  await ctx.addInitScript(() => { window.__open = []; window.open = (u) => { window.__open.push(String(u)); return null; }; });
  await ctx.addInitScript(() => {
    addEventListener("beforeunload", () => { window.__weg = true; });
    addEventListener("pagehide", () => { window.__weg = true; });
    const ce = console.error.bind(console);
    console.error = (...a) => ce(...(window.__weg ? ["[na pagehide]", ...a] : a));
  });
  return { ctx, extern };
}
// WebKit breekt lopende verzoeken af als de pagina zelf herlaadt (de app-laag doet dat na het terugzetten van de
// voortgang) en meldt dat als ‘Fetch API cannot load <eigen bestand> due to access control checks’; de verdwijnende
// pagina logt dan nog ‘de kaartondergrond kon niet worden geladen’. Dat is geen fout in de app: de nieuwe pagina laadt
// alles (kaartKlaar controleert dat). Daarom tellen niet mee: die WebKit-melding voor eigen bestanden, en wat een pagina
// nog logt nadat ze begon weg te gaan (beforeunload/pagehide; zie maakContext).
function volg(page) {
  const fouten = [];
  const telt = (t) => !(t.includes("due to access control checks") && t.includes(`localhost:${POORT}/`)) && !t.startsWith("[na pagehide]");
  page.on("pageerror", (e) => { if (telt(e.message)) fouten.push("pageerror: " + e.message); });
  page.on("console", (m) => { if (m.type() === "error" && telt(m.text())) fouten.push("console: " + m.text()); });
  return fouten;
}
async function kaartKlaar(page) {
  await page.waitForSelector("#map.leaflet-container", { timeout: 20000 });
  await page.waitForFunction(() => document.querySelectorAll("#map .leaflet-overlay-pane path, #map .leaflet-marker-icon").length > 5, null, { timeout: 20000 });
}

const browser = await pw[MOTOR].launch();
try {
  const prefs = new Map(), gedeeld = [];
  const { ctx, extern } = await maakContext(browser, prefs, gedeeld);
  const page = await ctx.newPage();
  const fouten = volg(page);
  let laadTijd = 0;

  await stap("start: index.html laadt, app-laag aanwezig, kaart getekend", async () => {
    const t0 = Date.now();
    await page.goto(BASIS);
    await kaartKlaar(page);
    laadTijd = Date.now() - t0;
    verwacht(await page.evaluate(() => !!window.bijbelreisApp && document.documentElement.dataset.app === "ios"), "app-laag niet geladen");
    verwacht(await page.evaluate(() => !document.querySelector('script[src*="bezoek.js"]')), "bezoek.js staat nog in de pagina");
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "1-start.png") });
  });

  await stap("geen service worker en geen manifest in de app", async () => {
    await page.waitForTimeout(500);
    verwacht(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length === 0), "er is een service worker aangemeld");
    verwacht(await page.evaluate(() => !document.querySelector('link[rel="manifest"], script[src*="pwa.js"], meta[name^="apple-mobile-web-app"]')), "manifest, pwa.js of web-app-meta staat nog in de pagina");
  });

  await stap("verhaal openen (#v1 via de lijst) en reis met kaart (#abraham/4)", async () => {
    await page.locator('#vLijst [data-v="1"]').first().click();
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "2-verhaal.png") });
    await page.goto(BASIS + "#abraham/4");
    await kaartKlaar(page);
    await page.waitForFunction(() => /Abraham|Kanaän|Sichem|Bethel|Egypte/.test(document.body.innerText));
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "3-reis.png") });
  });

  await stap("voortgang gaat naar de reservekopie (Preferences)", async () => {
    await page.waitForFunction(() => Object.keys(localStorage).some((k) => k.startsWith("bijbelreis:")));
    // De app-laag bewaart 0,8 s na de laatste wijziging; wacht tot de kopie bij is (hoogstens 6 s).
    let gelijk = false, verschil = "";
    for (let i = 0; i < 30 && !gelijk; i++) {
      await page.waitForTimeout(200);
      const r = prefs.get("bijbelreis-voortgang");
      if (!r) { verschil = "geen reservekopie"; continue; }
      const data = JSON.parse(r);
      const lokaal = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
      const sleutels = [...new Set([...Object.keys(data), ...Object.keys(lokaal)])].filter((k) => data[k] !== lokaal[k]);
      gelijk = sleutels.length === 0;
      verschil = "reservekopie wijkt af van localStorage: " + sleutels.join(", ");
    }
    verwacht(gelijk, verschil);
  });

  await stap("een deel van een reis kiezen opent geen ouderpoort en deelt niets", async () => {
    await page.goto(BASIS + "#abraham/2");
    await kaartKlaar(page);
    await page.waitForSelector("#delen .deel", { state: "attached" });
    await page.evaluate(() => { window.__open = []; document.querySelectorAll("#delen .deel")[1].click(); });
    await page.waitForTimeout(300);
    verwacht(await page.evaluate(() => document.getElementById("appPoort") === null || document.getElementById("appPoort").hidden), "ouderpoort ging open bij het kiezen van een deel");
    verwacht(gedeeld.length === 0, "er is gedeeld bij het kiezen van een deel");
  });

  await stap("ouderpoort: link naar buiten (Denckh) opent pas na de juiste som", async () => {
    await page.evaluate(() => document.querySelector(".maker a").click());
    await page.waitForSelector("#appPoort:not([hidden])");
    verwacht((await page.evaluate(() => window.__open.length)) === 0, "link ging al open zonder poort");
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "4-ouderpoort.png") });
    await page.fill("#appPoortIn", "1");
    await page.click("#appPoort button[type=submit]");
    await page.waitForFunction(() => /klopt niet/.test(document.getElementById("appPoortFout").textContent));
    verwacht((await page.evaluate(() => window.__open.length)) === 0, "link ging open na fout antwoord");
    const som = somUit(await page.textContent("#appPoortVraag"));
    await page.fill("#appPoortIn", String(som));
    await page.click("#appPoort button[type=submit]");
    await page.waitForSelector("#appPoort", { state: "hidden" });
    const open = await page.evaluate(() => window.__open);
    verwacht(open.length === 1 && open[0].startsWith("https://denckh.nl"), "verwacht denckh.nl, kreeg " + JSON.stringify(open));
  });

  await stap("ouderpoort: Sluiten doet niets", async () => {
    await page.evaluate(() => { window.__open = []; document.querySelector(".ook a").click(); });
    await page.waitForSelector("#appPoort:not([hidden])");
    await page.click("#appPoort [data-poort-dicht]");
    await page.waitForSelector("#appPoort", { state: "hidden" });
    verwacht((await page.evaluate(() => window.__open.length)) === 0, "link ging toch open");
  });

  await stap("‘Mis je iets?’: geen formulier, maar mail na de ouderpoort", async () => {
    await page.evaluate(() => { window.__open = []; document.querySelector("[data-aanvraag]").click(); });
    await page.waitForSelector("#appPoort:not([hidden])");
    verwacht(await page.evaluate(() => document.getElementById("aanvraagLade").hidden), "aanvraagformulier ging open");
    await page.fill("#appPoortIn", String(somUit(await page.textContent("#appPoortVraag"))));
    await page.click("#appPoort button[type=submit]");
    const open = await page.evaluate(() => window.__open);
    verwacht(open.length === 1 && open[0].startsWith("mailto:info@denckh.nl"), "verwacht mailto, kreeg " + JSON.stringify(open));
    verwacht(await page.evaluate(() => document.getElementById("aanvraagLade").hidden), "aanvraagformulier ging open");
  });

  await stap("delen: deelmenu (Share) na de ouderpoort, met de link naar bijbelreis.nl", async () => {
    await page.goto(BASIS + "#v26");
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    const knop = page.locator(".deelknop[data-deel]:visible").first();
    verwacht(await knop.count(), "geen deelknop gevonden");
    await knop.click();
    await page.waitForSelector("#appPoort:not([hidden])");
    verwacht(gedeeld.length === 0, "al gedeeld zonder poort");
    await page.fill("#appPoortIn", String(somUit(await page.textContent("#appPoortVraag"))));
    await page.click("#appPoort button[type=submit]");
    await page.waitForFunction(() => true);
    await page.waitForTimeout(200);
    verwacht(gedeeld.length === 1 && /^https:\/\/bijbelreis\.nl\/#/.test(gedeeld[0].url), "delen: " + JSON.stringify(gedeeld));
  });

  await stap("‘Bronnen en licenties’ opent de hulppagina in de app; de licentie van Leaflet opent daar in een venster", async () => {
    await page.evaluate(() => document.querySelector('.bronlink a[href="/bijbelreis/hulp#bronnen"]').click());
    await page.waitForURL(/\/bijbelreis\/hulp\.html#bronnen$/);
    await page.waitForSelector('a[href$="LICENSE-leaflet.txt"]', { state: "attached" });
    await page.evaluate(() => document.querySelector('a[href$="LICENSE-leaflet.txt"]').click());
    await page.waitForSelector("#appTekst:not([hidden]) pre");
    verwacht(/Leaflet|BSD|Copyright/i.test(await page.textContent("#appTekst pre")), "licentietekst leeg");
    verwacht(/\/bijbelreis\/hulp\.html/.test(page.url()) && !page.url().endsWith(".txt"), "pagina is weggegaan: " + page.url());
    await page.click("#appTekst [data-tekst-dicht]");
  });

  await stap("terug (history.back) sluit eerst een venster, zoals de veeg naar terug in de app", async () => {
    await page.goto(BASIS + "#abraham/4");
    await kaartKlaar(page);
    await page.locator("#kiesBtn").click();
    await page.waitForSelector("#kiesLade:not([hidden])");
    await page.goBack({ waitUntil: "commit" }).catch(() => {});
    await page.waitForFunction(() => document.getElementById("kiesLade").hidden);
    verwacht(page.url().includes("#abraham"), "terug ging verder dan het venster: " + page.url());
  });

  const poortOk = async (p) => { await p.waitForSelector("#appPoort:not([hidden])"); await p.fill("#appPoortIn", String(somUit(await p.textContent("#appPoortVraag")))); await p.click("#appPoort button[type=submit]"); await p.waitForSelector("#appPoort", { state: "hidden" }); };

  await stap("lesroutes: vanuit ‘Voor ouders’ naar de lesroutes in de app, en terug naar de atlas", async () => {
    await page.goto(BASIS + "#v1");
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    await page.evaluate(() => document.querySelector('details.parents a[href="/bijbelreis/lessen"]').click());
    await page.waitForURL(/\/bijbelreis\/lessen\.html$/);
    await page.waitForSelector(".ls-routes .ls-route");
    verwacht(await page.evaluate(() => !!window.bijbelreisApp && document.documentElement.dataset.app === "ios"), "app-laag niet geladen op de lesroutes");
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "5-lesroutes.png") });
    await page.locator(".ls-route").first().click();
    await page.waitForSelector(".ls-les");
    const nr = await page.evaluate(() => +document.querySelector(".ls-les-nr").textContent.match(/Geschiedenis (\d+)/)[1]);
    await page.locator('.ls-les a.bk-knop[href^="/bijbelreis#v"]').first().click();
    await page.waitForURL((u) => u.pathname === "/" && u.hash === "#v" + nr);
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    await page.goBack();
    await page.waitForSelector(".ls-les");
    verwacht(page.url().includes("/bijbelreis/lessen.html#"), "terug kwam niet bij de lesroute: " + page.url());
  });

  await stap("lesroutes: presentatie en afdrukken gaan via de ouderpoort naar bijbelreis.nl", async () => {
    await page.evaluate(() => { window.__open = []; });
    await page.locator('.ls-les a.bk-knop[href^="/bijbelreis/boekje"]').first().click();
    await poortOk(page);
    let open = await page.evaluate(() => window.__open);
    verwacht(open.length === 1 && /^https:\/\/bijbelreis\.nl\/bijbelreis\/boekje#v\d+&niveau=[abc]$/.test(open[0]), "presentatie: " + JSON.stringify(open));
    await page.evaluate(() => { window.__open = []; });
    await page.locator('[data-print="leiding"]').first().click();
    await poortOk(page);
    open = await page.evaluate(() => window.__open);
    verwacht(open.length === 1 && /^https:\/\/bijbelreis\.nl\/bijbelreis\/lessen#[\w-]+$/.test(open[0]), "afdrukken: " + JSON.stringify(open));
    verwacht(page.url().includes("/bijbelreis/lessen.html"), "pagina is weggegaan: " + page.url());
  });

  await stap("lesroutes: de digibordstand opent in de app (geen ouderpoort) en terug brengt je bij de les", async () => {
    await page.evaluate(() => { window.__open = []; });
    await page.locator('.ls-les a.bk-knop[href$="/bord"]').first().click();
    await page.waitForSelector(".lb", { state: "visible" });
    verwacht(await page.evaluate(() => document.getElementById("appPoort") === null || document.getElementById("appPoort").hidden), "ouderpoort ging open bij het digibord");
    verwacht((await page.evaluate(() => window.__open.length)) === 0, "digibord opende iets buiten de app");
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "6-digibord.png") });
    await page.goBack();
    await page.waitForSelector(".ls-les", { state: "visible" });
  });

  await stap("De wereld in die tijd: openen vanuit een geschiedenis, periodebestand uit de app, terug naar de geschiedenis", async () => {
    await page.goto(BASIS + "#v5");
    await page.waitForSelector(".wt-ingang", { state: "visible" });
    await page.locator(".wt-ingang").click();
    await page.waitForSelector("#wtLaag", { state: "visible" });
    await page.waitForSelector(".wt-app .wt-svg .wt-balk", { state: "attached" });
    verwacht(/#wereld\/adam-noach\/1656$/.test(page.url()), "adres: " + page.url());
    if (SHOTS) await page.screenshot({ path: join(SHOTS, "7-wereld.png") });
    await page.goBack();
    await page.waitForSelector("#wtLaag", { state: "hidden" });
    verwacht(page.url().endsWith("#v5"), "terug ging niet naar de geschiedenis: " + page.url());
  });

  await stap("privacy en hulp staan in de app; mailen gaat via de ouderpoort", async () => {
    await page.goto(BASIS + "#v1");
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    await page.evaluate(() => document.querySelector('details.parents a[href="/bijbelreis/privacy"]').click());
    await page.waitForURL(/\/bijbelreis\/privacy\.html$/);
    verwacht(/De app verzamelt niets/.test(await page.textContent("main")), "privacytekst ontbreekt");
    await page.evaluate(() => { window.__open = []; document.querySelector('main a[href^="mailto:"]').click(); });
    await poortOk(page);
    const open = await page.evaluate(() => window.__open);
    verwacht(open.length === 1 && open[0] === "mailto:info@denckh.nl", "mail: " + JSON.stringify(open));
    await page.evaluate(() => document.querySelector('a[href="/bijbelreis/hulp"]').click());
    await page.waitForURL(/\/bijbelreis\/hulp\.html$/);
    await page.evaluate(() => document.querySelector(".bk-terug").click());
    await page.waitForURL((u) => u.pathname === "/");
    await kaartKlaar(page);
  });

  await stap("een verhaalpagina van de website (/verhaal/26-…) opent dezelfde geschiedenis in de atlas", async () => {
    await page.evaluate(() => { const a = document.createElement("a"); a.href = "/verhaal/26-jakob"; a.id = "__v"; a.textContent = "x"; document.body.appendChild(a); a.click(); });
    await page.waitForFunction(() => location.hash === "#v26");
    await page.waitForSelector("#p-verhalen .verhaal", { state: "visible" });
    verwacht(await page.evaluate(() => location.pathname === "/"), "niet in de atlas gebleven");
  });

  await stap("opslag leeg geraakt terwijl de app openstaat (localStorage.clear) → kopie blijft, herstel na herladen", async () => {
    const voor = prefs.get("bijbelreis-voortgang");
    await page.evaluate(() => { sessionStorage.removeItem("bijbelreis-app:hersteld"); localStorage.clear(); });
    await page.reload();
    await kaartKlaar(page);
    await page.waitForFunction(() => Object.keys(localStorage).some((k) => k.startsWith("bijbelreis:verhalen") || k.startsWith("bijbelreis:gezien")), null, { timeout: 15000 });
    await page.waitForTimeout(1200);
    const oud = JSON.parse(voor), nieuw = JSON.parse(prefs.get("bijbelreis-voortgang") || "{}");
    verwacht(Object.keys(oud).length > 1 && Object.keys(oud).every((k) => k in nieuw), "reservekopie is overschreven: " + Object.keys(nieuw).join(","));
    const lokaal = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")));
    verwacht(Object.keys(oud).every((k) => lokaal.includes(k)), "niet alles hersteld: " + lokaal.join(","));
  });

  await stap("geen /api/-verzoeken, geen verzoeken naar buiten, geen fouten", async () => {
    verwacht(apiVerzoeken.length === 0, "api: " + apiVerzoeken.join(", "));
    verwacht(extern.length === 0, "extern: " + extern.slice(0, 5).join(", "));
    verwacht(fouten.length === 0, fouten.slice(0, 5).join(" | "));
  });
  await ctx.close();

  // iOS ruimt de opslag van de webview op: een nieuwe context met lege localStorage, maar mét de reservekopie.
  await stap("herstel: lege localStorage + reservekopie → voortgang terug na één herlaadbeurt", async () => {
    const voor = JSON.parse(prefs.get("bijbelreis-voortgang"));
    const { ctx: c2 } = await maakContext(browser, prefs, []);
    const p2 = await c2.newPage();
    const f2 = volg(p2);
    await p2.goto(BASIS);
    await p2.waitForFunction((n) => Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).length >= n, Object.keys(voor).length, { timeout: 15000 });
    await kaartKlaar(p2);
    const na = await p2.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:")).map((k) => [k, localStorage.getItem(k)])));
    for (const [k, v] of Object.entries(voor)) if (k !== "bijbelreis:stap" && na[k] !== v) throw new Error("sleutel " + k + " niet hersteld");
    const ladingen = Number(await p2.evaluate(() => sessionStorage.getItem("__ladingen")));
    verwacht(ladingen === 2, "verwacht 2 ladingen (begin + herstel), kreeg " + ladingen);
    verwacht(await p2.evaluate(() => sessionStorage.getItem("bijbelreis-app:hersteld") === "1"), "herstel niet gemarkeerd");
    verwacht(f2.length === 0, f2.slice(0, 3).join(" | "));
    await c2.close();
  });

  await stap("eerste start zonder reservekopie: geen herlaadbeurt", async () => {
    const { ctx: c3 } = await maakContext(browser, new Map(), []);
    const p3 = await c3.newPage();
    await p3.goto(BASIS);
    await kaartKlaar(p3);
    await p3.waitForTimeout(800);
    const ladingen = Number(await p3.evaluate(() => sessionStorage.getItem("__ladingen")));
    verwacht(ladingen === 1, "verwacht 1 lading, kreeg " + ladingen);
    await c3.close();
  });

  console.log(resultaten.join("\n"));
  console.log(`\nKaart klaar na ${laadTijd} ms (${MOTOR} in Playwright, geen iPhone).`);
} finally {
  await browser.close();
  server.close();
}
if (mislukt) { console.error(`\n${mislukt} stap(pen) mislukt`); process.exit(1); }
console.log("\nAlle stappen geslaagd.");
