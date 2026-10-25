// Rendert de 3D-posters en museumobjecten vooraf naar WebP (public/3d) en schrijft de
// ankerpunten van de interactieve machines naar src/three/anchors.json.
// Gebruik: node scripts/render-3d.mjs [filter]
// Draait headless Chromium (SwiftShader) tegen een tijdelijke Vite-server; geen GPU nodig.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";
import { chromium } from "playwright";

const filter = process.argv[2] ?? "";
const ANCHORS = "src/three/anchors.json";

/** Elke taak: één render, één of meer uitvoerbreedtes. */
const JOBS = [
  { name: "machine-wide", query: "scene=machine&cam=wide", w: 1500, h: 1219, out: [900, 1500], anchors: ["machine", "wide"] },
  { name: "machine-compact", query: "scene=machine&cam=compact", w: 1000, h: 974, out: [600, 1000], anchors: ["machine", "compact"] },
  { name: "console-wide", query: "scene=console&cam=wide", w: 1600, h: 1120, out: [1000, 1600], anchors: ["console", "wide"] },
  { name: "console-compact", query: "scene=console&cam=compact", w: 1000, h: 1282, out: [600, 1000], anchors: ["console", "compact"] },
  ...(await import("./render-3d.jobs.mjs").then((m) => m.default).catch(() => [])),
];

const server = await createServer({ server: { port: 5199, strictPort: false, host: "127.0.0.1" }, logLevel: "error" });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, "");
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
mkdirSync("public/3d", { recursive: true });
let anchors = {};
try {
  anchors = JSON.parse(readFileSync(ANCHORS, "utf8"));
} catch {}

try {
  for (const job of JOBS.filter((j) => j.name.includes(filter))) {
    const t0 = Date.now();
    const page = await browser.newPage({ viewport: { width: Math.min(job.w * 8, 4000), height: job.h }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error(job.name, e.message));
    await page.goto(`${base}/dev/render.html?${job.query}&w=${job.w}&h=${job.h}`);
    await page.waitForFunction(() => window.__done || window.__error, null, { timeout: 180_000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(`${job.name}: ${err}`);
    const files = await page.evaluate((widths) => {
      const src = document.getElementById("c");
      return widths.map((w) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = Math.round((src.height / src.width) * w);
        const g = c.getContext("2d");
        g.imageSmoothingQuality = "high";
        g.drawImage(src, 0, 0, c.width, c.height);
        return c.toDataURL("image/webp", 0.86);
      });
    }, job.out);
    files.forEach((data, i) => {
      const file = job.out.length > 1 ? `public/3d/${job.name}-${job.out[i]}.webp` : `public/3d/${job.name}.webp`;
      writeFileSync(file, Buffer.from(data.split(",")[1], "base64"));
    });
    if (job.anchors) {
      const a = await page.evaluate(() => window.__anchors);
      const [group, key] = job.anchors;
      const round = JSON.parse(JSON.stringify(a), (_, v) => (typeof v === "number" ? +v.toFixed(4) : v));
      anchors[group] = { ...(anchors[group] ?? {}), [key]: round };
    }
    await page.close();
    console.log(`${job.name}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  writeFileSync(ANCHORS, JSON.stringify(anchors, null, 2) + "\n");
} finally {
  await browser.close();
  await server.close();
}
