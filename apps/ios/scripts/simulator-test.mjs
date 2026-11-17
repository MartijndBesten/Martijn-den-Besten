// Test in de iOS-simulator (alleen op een Mac met Xcode; zo draait hij in .github/workflows/ios.yml):
//  1. de Release-build (precies wat in de App Store komt, zonder testloper) start en toont de atlas;
//  2. de Debug-build met de testloper (ios/App/App/BijbelreisTest.swift) loopt het scenario ‘test’ af in de echte
//     WKWebView (navigeren, terug vegen, verhaal, tijdlijn, De wereld in die tijd, ouderpoort, lesroutes, digibord,
//     privacy, reservekopie), daarna ‘herstart’ (app afsluiten en opnieuw starten: voortgang er nog);
//  3. het scenario ‘appstore’ maakt de schermafbeeldingen voor de App Store in de echte iOS-weergave.
// Elke schermafbeelding wordt gecontroleerd op een wit of leeg scherm (spreiding, aandeel wit, aantal kleuren).
//
//   node scripts/simulator-test.mjs --release <Release-iphonesimulator/App.app> --debug <Debug-iphonesimulator/App.app> --uit <map>
//
// Toestellen: iPhone 17 Pro Max (6,9"), iPhone 17 Pro (6,3", alleen App Store-beelden) en iPad Pro 13-inch (M5), op
// de nieuwste iOS-runtime die op de runner staat. sharp komt uit de node_modules van de repository.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "./simulator-scenario.mjs";

const hier = dirname(fileURLToPath(import.meta.url));
const sharp = createRequire(join(hier, "..", "..", "package.json"))("sharp");
const BUNDEL = "nl.bijbelreis.app";
const arg = (n) => { const i = process.argv.indexOf("--" + n); return i > 0 ? resolve(process.argv[i + 1]) : null; };
const RELEASE = arg("release"), DEBUG = arg("debug"), UIT = arg("uit") || resolve("simulator-uitkomst");
for (const [n, p] of [["--release", RELEASE], ["--debug", DEBUG]]) if (!p || !existsSync(p)) throw new Error(`${n}: app niet gevonden (${p})`);
rmSync(UIT, { recursive: true, force: true });
mkdirSync(UIT, { recursive: true });

const TOESTELLEN = [
  { naam: "iPhone 17 Pro Max", map: "iphone-6.9", scenario: ["test", "herstart", "liggend", "appstore"], maat: [1320, 2868] },
  // iPad: niet liggend. iPadOS 26 staat in de venstermodus van de simulator geen programmatisch draaien toe
  // (requestGeometryUpdate: ‘De huidige venstermodus staat geen programmatische wijzigingen toe…’).
  { naam: "iPad Pro 13-inch (M5)", map: "ipad-13", scenario: ["test", "herstart", "appstore"], maat: [2064, 2752] },
  { naam: "iPhone 17 Pro", map: "iphone-6.3", scenario: ["appstore"], maat: [1206, 2622] },
];

const log = (...t) => console.log(new Date().toISOString().slice(11, 19), ...t);
const sim = (...a) => execFileSync("xcrun", ["simctl", ...a], { encoding: "utf8", maxBuffer: 64 << 20, timeout: 600000 }).trim();
const slaap = (ms) => new Promise((k) => setTimeout(k, ms));

// Wit of leeg scherm? Op 200 px breed: gemiddelde spreiding van R, G en B, aandeel (bijna) wit, kleuren met > 0,2 %.
// Gemeten (november 2026): atlas 35–80 / 0,0–0,5 / 20–55; digibord 28 / 0,9 / 11; alleen het opstartscherm 12 / 0 / 2.
async function beeldMaat(pad) {
  const { data, info } = await sharp(pad).removeAlpha().resize({ width: 200 }).raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height, bakken = new Map(), som = [0, 0, 0], kw = [0, 0, 0];
  let wit = 0;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) wit++;
    const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    bakken.set(k, (bakken.get(k) || 0) + 1);
    [r, g, b].forEach((v, j) => { som[j] += v; kw[j] += v * v; });
  }
  const spreiding = som.map((s, j) => Math.sqrt(kw[j] / n - (s / n) ** 2)).reduce((a, b) => a + b) / 3;
  const kleuren = [...bakken.values()].filter((c) => c / n > 0.002).length;
  const m = await sharp(pad).metadata();
  return { breed: m.width, hoog: m.height, spreiding: Math.round(spreiding * 10) / 10, wit: Math.round((wit / n) * 1000) / 1000, kleuren };
}
const leeg = (m) => m.spreiding < 15 || m.wit > 0.97 || m.kleuren < 6;

const fouten = [];
const verslag = [];
// simctl kan na het draaien een oud beeld teruggeven (gezien: liggend, twee keer exact hetzelfde beeld voor verschillende
// schermen, terwijl de pagina wel klopte). Dan een paar keer opnieuw; blijft het gelijk, dan een waarschuwing.
const waarschuwingen = [];
let vorigeHash = "";
const hashVan = (p) => createHash("sha1").update(readFileSync(p)).digest("hex");
async function foto(udid, pad, verwacht) {
  for (let poging = 0; ; poging++) {
    neem(udid, pad);
    const h = hashVan(pad);
    if (h !== vorigeHash) { vorigeHash = h; break; }
    if (poging >= 4) { waarschuwingen.push(`${pad.slice(UIT.length + 1)}: zelfde beeld als de vorige schermafbeelding`); break; }
    await slaap(1500);
  }
  await meet(pad, verwacht);
}
function neem(udid, pad) {
  // simctl io kan bij drukte op de runner even blijven hangen (gezien: 100 s op de iPad); dan één keer opnieuw.
  try { execFileSync("xcrun", ["simctl", "io", udid, "screenshot", "--type=png", pad], { timeout: 90000, stdio: "pipe" }); }
  catch { log("  schermafbeelding duurde te lang, opnieuw"); sim("io", udid, "screenshot", "--type=png", pad); }
}
async function meet(pad, verwacht) {
  const m = await beeldMaat(pad);
  const naam = pad.slice(UIT.length + 1);
  verslag.push({ beeld: naam, ...m });
  if (leeg(m)) fouten.push(`${naam}: lijkt leeg of wit (${JSON.stringify(m)})`);
  if (verwacht && (m.breed !== verwacht[0] || m.hoog !== verwacht[1])) fouten.push(`${naam}: ${m.breed}×${m.hoog}, verwacht ${verwacht.join("×")}`);
  log("  foto", naam, JSON.stringify(m));
}

function runtime() {
  const r = JSON.parse(sim("list", "runtimes", "--json")).runtimes.filter((x) => x.isAvailable && x.platform === "iOS");
  r.sort((a, b) => a.version.localeCompare(b.version, "en", { numeric: true }));
  if (!r.length) throw new Error("geen iOS-runtime beschikbaar");
  return r[r.length - 1];
}
function toesteltype(naam) {
  const t = JSON.parse(sim("list", "devicetypes", "--json")).devicetypes.find((x) => x.name === naam);
  if (!t) throw new Error(`toesteltype ‘${naam}’ niet gevonden; beschikbaar: ${JSON.parse(sim("list", "devicetypes", "--json")).devicetypes.map((x) => x.name).join(", ")}`);
  return t.identifier;
}

async function draaiScenario(udid, naam, map, maat) {
  vorigeHash = "";
  const data = sim("get_app_container", udid, BUNDEL, "data");
  const test = join(data, "Documents", "test");
  mkdirSync(test, { recursive: true });
  writeFileSync(join(test, naam + ".json"), JSON.stringify(SCENARIOS[naam]));
  const uitkomst = join(test, naam + "-resultaat.json"), fotoTxt = join(test, "foto.txt");
  rmSync(uitkomst, { force: true });
  rmSync(fotoTxt, { force: true });
  execFileSync("xcrun", ["simctl", "launch", "--terminate-running-process", udid, BUNDEL], { env: { ...process.env, SIMCTL_CHILD_BIJBELREIS_TEST: naam }, encoding: "utf8" });
  const tot = Date.now() + 12 * 60000;
  let r = null;
  while (Date.now() < tot) {
    if (existsSync(fotoTxt)) {
      const f = readFileSync(fotoTxt, "utf8").trim().replace(/[^a-z0-9-]/gi, "");
      await foto(udid, join(map, `${naam === "appstore" ? "appstore-" : ""}${f}.png`), naam === "appstore" ? maat : null);
      rmSync(fotoTxt, { force: true });
    }
    if (existsSync(uitkomst)) {
      try { r = JSON.parse(readFileSync(uitkomst, "utf8")); } catch { r = null; }
      if (r && r.klaar) break;
    }
    await slaap(250);
  }
  if (!r || !r.klaar) { fouten.push(`${map.slice(UIT.length + 1)} ${naam}: geen uitkomst binnen de tijd (${r ? r.stappen.length + " stappen klaar" : "niets"})`); return r; }
  copyFileSync(uitkomst, join(map, naam + "-resultaat.json"));
  for (const s of r.stappen) log(`  ${s.ok ? "ok  " : "FOUT"} ${naam}: ${s.naam} (${s.ms} ms)${s.fout ? "\n        " + s.fout : s.waarde !== undefined ? "  → " + JSON.stringify(s.waarde).slice(0, 160) : ""}`);
  const mis = r.stappen.filter((s) => !s.ok);
  if (mis.length) fouten.push(`${map.slice(UIT.length + 1)} ${naam}: ${mis.map((s) => s.naam + ": " + s.fout).join("; ")}`);
  else if (r.stappen.length !== SCENARIOS[naam].length) fouten.push(`${map.slice(UIT.length + 1)} ${naam}: ${r.stappen.length} van ${SCENARIOS[naam].length} stappen`);
  if (r.paginaFouten && r.paginaFouten.length) fouten.push(`${map.slice(UIT.length + 1)} ${naam}: fouten in de pagina: ${r.paginaFouten.slice(0, 5).join(" | ")}`);
  return r;
}

const rt = runtime();
log(`iOS-runtime: ${rt.name} (${rt.identifier})`);
for (const t of TOESTELLEN) {
  const map = join(UIT, t.map);
  mkdirSync(map, { recursive: true });
  const udid = sim("create", `Bijbelreis-test ${t.naam}`, toesteltype(t.naam), rt.identifier);
  log(`${t.naam}: ${udid}`);
  try {
    // Nederlands, zoals bij de gezinnen die de app gebruiken (ook de statusbalk op de App Store-beelden).
    try {
      const pref = join(process.env.HOME, "Library/Developer/CoreSimulator/Devices", udid, "data/Library/Preferences");
      mkdirSync(pref, { recursive: true });
      execFileSync("defaults", ["write", join(pref, ".GlobalPreferences.plist"), "AppleLanguages", "-array", "nl-NL"]);
      execFileSync("defaults", ["write", join(pref, ".GlobalPreferences.plist"), "AppleLocale", "-string", "nl_NL"]);
    } catch (e) { log("  taal niet ingesteld:", String(e.message).split("\n")[0]); }
    sim("boot", udid);
    sim("bootstatus", udid, "-b");
    // Vaste statusbalk voor de App Store-beelden (Apple’s voorbeeldtijd, volle batterij).
    sim("status_bar", udid, "override", "--time", "9:41", "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3", "--cellularMode", "active", "--cellularBars", "4", "--batteryState", "charged", "--batteryLevel", "100");
    sim("ui", udid, "appearance", "light");

    // 1. Release-build: start hij en toont hij de atlas (geen testloper, dus alleen kijken)?
    sim("install", udid, RELEASE);
    sim("launch", udid, BUNDEL);
    await slaap(20000);
    await foto(udid, join(map, "00-release-start.png"));
    sim("terminate", udid, BUNDEL);

    // 2./3. Debug-build met de testloper. Installeren over de Release-build heen houdt de gegevens van de app.
    sim("install", udid, DEBUG);
    for (const s of t.scenario) {
      log(`${t.naam}: scenario ${s}`);
      await draaiScenario(udid, s, map, t.maat);
      sim("terminate", udid, BUNDEL);
    }
  } catch (e) {
    fouten.push(`${t.map}: ${String(e.message || e).split("\n")[0]}`);
    log(e);
  } finally {
    try { sim("shutdown", udid); } catch { /* al uit */ }
    try { sim("delete", udid); } catch { /* niets */ }
  }
}

// App Store-beelden als JPEG (zonder alfakanaal), zoals scripts/screenshots.mjs ze in store/screenshots/ zet.
for (const t of TOESTELLEN) {
  const doel = join(UIT, "appstore", t.map);
  mkdirSync(doel, { recursive: true });
  for (const s of SCENARIOS.appstore.filter((x) => x.foto)) {
    const p = join(UIT, t.map, `appstore-${s.foto}.png`);
    if (existsSync(p)) await sharp(p).flatten({ background: "#f5f0e5" }).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(join(doel, s.foto + ".jpg"));
  }
}
writeFileSync(join(UIT, "verslag.json"), JSON.stringify({ runtime: rt.name, beelden: verslag, waarschuwingen, fouten }, null, 1));
if (waarschuwingen.length) console.log("\nWaarschuwing (de pagina zelf is wel gecontroleerd):\n  " + waarschuwingen.join("\n  "));
if (fouten.length) { console.error("\nMISLUKT:\n  " + fouten.join("\n  ")); process.exit(1); }
log(`Alles geslaagd: ${verslag.length} schermafbeeldingen, geen leeg scherm.`);
