// Laadt /bijbelreis lokaal in een browser en meldt consolefouten, onbekende plaatsen en ontbrekende Bijbelverwijzingen.
// Gebruik: node scripts/bijbelreis-check.mjs   (bouwt niets; gebruikt public/ rechtstreeks)
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL("../public/", import.meta.url).pathname;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/bijbelreis") p = "/bijbelreis.html";
  try { const buf = await readFile(join(root, p)); res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); res.end(buf); }
  catch { res.writeHead(404); res.end("niet gevonden"); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const problems = [];
page.on("pageerror", (e) => problems.push("pagefout: " + e.message));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") problems.push(m.type() + ": " + m.text()); });
page.on("requestfailed", (r) => problems.push("niet geladen: " + r.url()));
page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()}: ${r.url()}`); });
await page.goto(`http://127.0.0.1:${port}/bijbelreis`);
await page.waitForTimeout(1500);
const report = await page.evaluate(() => {
  const out = { boeken: [], refs: [] };
  for (const b of BR.boeken) {
    out.boeken.push({ boek: b.n, delen: b.delen.map((d) => `${d.n} (${d.steps.length} stappen, quiz ${(d.quiz?.tap || []).length}/${(d.quiz?.mc || []).length}/${(d.quiz?.ord || []).length})`) });
    for (const d of b.delen) for (const s of d.steps) if (!s.ref || !s.t || !s.txt || !s.stamp) out.refs.push(`${b.n}/${d.n}: stap zonder ref/t/txt/stamp`);
  }
  return out;
});
// Alle delen en stappen doorlopen, zodat fouten in de inhoud naar boven komen.
const nParts = await page.evaluate(() => BR.boeken.reduce((a, b) => a + b.delen.length, 0));
for (let i = 0; i < nParts; i++) {
  const ok = await page.evaluate((i) => { const all = BR.boeken.flatMap((b) => b.delen); const d = all[i]; const btn = [...document.querySelectorAll(".boek")].find((x) => x.dataset.boek === d.boek.id); btn && btn.click(); const dl = [...document.querySelectorAll(".deel")].find((x) => x.dataset.deel === d.id); if (!dl) return false; dl.click(); return true; }, i);
  if (!ok) problems.push(`deel ${i} niet aanklikbaar`);
  const steps = await page.evaluate(() => document.querySelectorAll(".dot").length);
  for (let s = 0; s < steps; s++) { await page.evaluate((s) => document.querySelector(`.dot[data-step="${s}"]`).click(), s); await page.waitForTimeout(30); }
}
await page.waitForTimeout(500);
console.log(JSON.stringify(report, null, 1));
console.log(problems.length ? "PROBLEMEN:\n" + [...new Set(problems)].join("\n") : "Geen problemen gevonden.");
await browser.close(); server.close();
process.exit(problems.length ? 1 : 0);
