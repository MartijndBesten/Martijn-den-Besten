// Zet alle taferelen van de Bijbelreis naast elkaar op één pagina en maakt daar schermafbeeldingen van,
// zodat een mens of een volgende tekenaar ze in één keer kan beoordelen. Bouwt niets; gebruikt public/ rechtstreeks.
// Gebruik: node scripts/taferelen-overzicht.mjs [uitvoermap] [--alleen id,id] [--los]
//   standaard uitvoermap: docs/bijbelreis-taferelen/overzicht
// Maakt: desktop.png en telefoon.png (eindstand, zoals bij ‘minder beweging’) en begin.png (de beginstand van de
// beweging); met --los ook elk tafereel apart en groot in los/<id>.png. Meldt het gewicht en het aantal stappen per beeld.
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { laadBR, ROOT, PUB } from "./niveaus/br.mjs";

const args = process.argv.slice(2), ai = args.indexOf("--alleen");
const alleen = ai >= 0 ? args.splice(ai, 2)[1].split(",") : null;
const li = args.indexOf("--los"), los = li >= 0 && !!args.splice(li, 1);
const uit = resolve(args[0] || join(ROOT, "docs", "bijbelreis-taferelen", "overzicht"));

// Welke stappen krijgen welk beeld? Dezelfde regel als in de app (BR.tafereel.van).
const BR = laadBR();
const stappen = BR.boeken.flatMap((b) => b.delen.flatMap((d) => d.steps.map((s, i) => ({ ...s, key: `${b.id}:${d.id}:${i}`, at: s.at || [] }))));
const per = {};
for (const s of stappen) { const b = BR.tafereel.van(s); if (b) (per[b.id] ??= []).push(s.key); }
const zonderReis = stappen.filter((s) => !(s.r && s.r.length));
const metBeeld = stappen.filter((s) => BR.tafereel.van(s));
const ids = Object.keys(BR.taferelen).filter((id) => !alleen || alleen.includes(id));
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="(\/bijbelreis\/(?:plaatsen|taferelen[^"]*)\.js)"/g)].map((m) => m[1]);
const gewicht = scripts.filter((s) => /taferelen(?!-koppeling)/.test(s)).reduce((a, s) => a + readFileSync(join(PUB, s)).length, 0);

const pagina = `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Taferelen van de Bijbelreis</title><link rel="stylesheet" href="/bijbelreis/bijbelreis.css">
<style>html, body { height: auto; } body { display: block; padding: 16px; } h1 { font-size: 1.3rem; margin: 0 0 4px; } .uitleg { margin: 0 0 16px; color: var(--fg-2); font-size: .9rem; }
.rooster { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px 16px; } .cel { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.cel .tafereel { max-width: none; } .cel code { font-family: var(--font-mono); font-size: 11px; color: var(--fg-3); }
body.begin .tf-svg * { animation-play-state: paused !important; } body.begin .tf-opnieuw { display: none; }</style>
<h1>Taferelen van de Bijbelreis</h1><p class="uitleg" id="uitleg"></p><div class="rooster" id="rooster"></div>
${scripts.map((s) => `<script src="${s}"></script>`).join("")}
<script>
const PER = ${JSON.stringify(per)}, IDS = ${JSON.stringify(ids)};
document.body.classList.toggle("begin", location.search.includes("begin"));
window.fouten = [];
for (const id of IDS) {
  const tf = BR.taferelen[id], koppel = Object.values(BR.beelden || {}).find((k) => k.t === id && k.tekst);
  const doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + tf.svg + "</svg>", "image/svg+xml");
  if (doc.querySelector("parsererror")) window.fouten.push(id + ": geen geldige SVG");
  const cel = document.createElement("div"); cel.className = "cel"; cel.id = "tf-" + id;
  cel.appendChild(BR.tafereel.maak(tf.bij || !koppel ? { id, tf, plaats: "(plaatsnaam)", algemeen: true } : { id, tf, tekst: koppel.tekst }));
  const c = document.createElement("code"); c.textContent = id + " · " + tf.svg.length + " tekens · " + (PER[id] || []).length + " stappen"; cel.appendChild(c);
  document.getElementById("rooster").appendChild(cel);
}
document.getElementById("uitleg").textContent = IDS.length + " taferelen · " + ${gewicht} + " bytes aan tekenbestanden · ${metBeeld.length} van de ${stappen.length} stappen hebben een beeld" + (location.search.includes("begin") ? " · beginstand van de beweging" : " · eindstand");
</script></html>`;

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/taferelen") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(pagina); return; }
  try { const buf = await readFile(join(PUB, p)); res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); res.end(buf); }
  catch { res.writeHead(404); res.end("niet gevonden"); }
}).listen(0);
const basis = `http://127.0.0.1:${server.address().port}/taferelen`;
await mkdir(los ? join(uit, "los") : uit, { recursive: true });
const browser = await chromium.launch();
const problemen = [];
async function foto(naam, breedte, query, opties) {
  const page = await (await browser.newContext({ viewport: { width: breedte, height: 900 }, deviceScaleFactor: 1, ...opties })).newPage();
  page.on("pageerror", (e) => problemen.push("pagefout: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") problemen.push("console: " + m.text()); });
  await page.goto(basis + query);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  problemen.push(...(await page.evaluate(() => window.fouten)));
  await page.screenshot({ path: join(uit, naam + ".png"), fullPage: true });
  return page;
}
await foto("desktop", 1280, "", { reducedMotion: "reduce" });
await foto("telefoon", 390, "", { reducedMotion: "reduce", deviceScaleFactor: 1.5 });
if (los) { const groot = await foto("desktop", 1280, "", { reducedMotion: "reduce", deviceScaleFactor: 2 }); for (const id of ids) await groot.locator(`#tf-${id} .tf-kader`).screenshot({ path: join(uit, "los", id + ".png") }); }
await foto("begin", 1280, "?begin", {});
await browser.close(); server.close();

console.log(`Taferelen: ${ids.length} · tekenbestanden samen ${gewicht} bytes`);
for (const id of ids) console.log(`  ${id.padEnd(16)} ${String(BR.taferelen[id].svg.length).padStart(5)} tekens · ${(per[id] || []).length} stappen`);
console.log(`Stappen met een beeld: ${metBeeld.length} van ${stappen.length} (zonder reis: ${zonderReis.length}, daarvan met beeld: ${zonderReis.filter((s) => BR.tafereel.van(s)).length})`);
console.log(`Schermafbeeldingen in ${uit}: desktop.png, telefoon.png, begin.png${los ? " en los/<id>.png" : ""}`);
if (problemen.length) { console.log("PROBLEMEN:\n" + [...new Set(problemen)].join("\n")); process.exit(1); }
